/**
 * useWebViewPerformance - React hook for monitoring WebView bridge performance
 * Tracks FPS, latency, memory usage, and provides performance optimization suggestions
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getPhaserBridge } from '../gameEngine/phaser/integration/PhaserWebViewBridge';
import { MessagePerformanceTracker } from '../gameEngine/phaser/integration/MessageTypes';

const PERFORMANCE_THRESHOLDS = {
  fps: {
    excellent: 58,
    good: 50,
    acceptable: 40,
    poor: 30,
  },
  latency: {
    excellent: 16,
    good: 33,
    acceptable: 50,
    poor: 100,
  },
  droppedFrames: {
    excellent: 0,
    good: 2,
    acceptable: 5,
    poor: 10,
  },
};

const useWebViewPerformance = (options = {}) => {
  const {
    sampleInterval = 1000, // How often to sample metrics (ms)
    historySize = 60, // Number of samples to keep
    autoOptimize = true, // Automatically adjust quality for performance
    onPerformanceWarning = null,
    onPerformanceOptimized = null,
  } = options;
  
  const [metrics, setMetrics] = useState({
    fps: 0,
    avgFps: 0,
    minFps: 60,
    maxFps: 60,
    latency: 0,
    avgLatency: 0,
    maxLatency: 0,
    droppedFrames: 0,
    totalDroppedFrames: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    messageRate: 0,
    performanceScore: 100,
    performanceLevel: 'excellent',
  });
  
  const [optimizations, setOptimizations] = useState({
    renderQuality: 'high',
    particleEffects: true,
    shadows: true,
    antialiasing: false,
    targetFps: 60,
  });
  
  const [warnings, setWarnings] = useState([]);
  
  const bridgeRef = useRef(null);
  const trackerRef = useRef(new MessagePerformanceTracker());
  const historyRef = useRef({
    fps: [],
    latency: [],
    droppedFrames: [],
  });
  const samplingIntervalRef = useRef(null);
  const lastOptimizationRef = useRef(0);
  
  // Initialize performance monitoring
  useEffect(() => {
    bridgeRef.current = getPhaserBridge();
    
    // Subscribe to performance updates
    const handlePerformanceUpdate = (data) => {
      updateMetrics(data);
    };
    
    const handlePerformanceWarning = (warning) => {
      addWarning(warning);
      if (autoOptimize) {
        optimizePerformance(warning);
      }
    };
    
    bridgeRef.current.on('performanceUpdate', handlePerformanceUpdate);
    bridgeRef.current.on('performanceWarning', handlePerformanceWarning);
    
    // Start sampling
    startSampling();
    
    return () => {
      if (bridgeRef.current) {
        bridgeRef.current.off('performanceUpdate', handlePerformanceUpdate);
        bridgeRef.current.off('performanceWarning', handlePerformanceWarning);
      }
      stopSampling();
    };
  }, [autoOptimize]);
  
  // Update metrics with new data
  const updateMetrics = useCallback((data) => {
    const { fps = 0, latency = 0, droppedFrames = 0 } = data;
    
    // Update history
    historyRef.current.fps.push(fps);
    historyRef.current.latency.push(latency);
    historyRef.current.droppedFrames.push(droppedFrames);
    
    // Maintain history size
    Object.keys(historyRef.current).forEach(key => {
      if (historyRef.current[key].length > historySize) {
        historyRef.current[key].shift();
      }
    });
    
    // Calculate averages and extremes
    const fpsHistory = historyRef.current.fps;
    const latencyHistory = historyRef.current.latency;
    const droppedHistory = historyRef.current.droppedFrames;
    
    const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
    const minFps = Math.min(...fpsHistory);
    const maxFps = Math.max(...fpsHistory);
    
    const avgLatency = latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length;
    const maxLatency = Math.max(...latencyHistory);
    
    const totalDroppedFrames = droppedHistory.reduce((a, b) => a + b, 0);
    
    // Calculate performance score
    const performanceScore = calculatePerformanceScore({
      fps: avgFps,
      latency: avgLatency,
      droppedFrames: totalDroppedFrames,
    });
    
    const performanceLevel = getPerformanceLevel(performanceScore);
    
    // Get message metrics
    const messageMetrics = trackerRef.current.getReport();
    
    setMetrics(prev => ({
      ...prev,
      fps,
      avgFps,
      minFps,
      maxFps,
      latency,
      avgLatency,
      maxLatency,
      droppedFrames,
      totalDroppedFrames,
      performanceScore,
      performanceLevel,
      messageRate: messageMetrics.sent / (Date.now() / 1000),
      ...data,
    }));
  }, [historySize]);
  
  // Calculate overall performance score (0-100)
  const calculatePerformanceScore = useCallback(({ fps, latency, droppedFrames }) => {
    let score = 100;
    
    // FPS impact (40% weight)
    if (fps < PERFORMANCE_THRESHOLDS.fps.excellent) {
      score -= (PERFORMANCE_THRESHOLDS.fps.excellent - fps) * 0.8;
    }
    
    // Latency impact (40% weight)
    if (latency > PERFORMANCE_THRESHOLDS.latency.excellent) {
      score -= Math.min(40, (latency - PERFORMANCE_THRESHOLDS.latency.excellent) * 0.4);
    }
    
    // Dropped frames impact (20% weight)
    if (droppedFrames > PERFORMANCE_THRESHOLDS.droppedFrames.excellent) {
      score -= Math.min(20, droppedFrames * 2);
    }
    
    return Math.max(0, Math.round(score));
  }, []);
  
  // Get performance level based on score
  const getPerformanceLevel = useCallback((score) => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'acceptable';
    return 'poor';
  }, []);
  
  // Add performance warning
  const addWarning = useCallback((warning) => {
    const newWarning = {
      ...warning,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    
    setWarnings(prev => {
      const updated = [...prev, newWarning];
      // Keep only last 10 warnings
      return updated.slice(-10);
    });
    
    if (onPerformanceWarning) {
      onPerformanceWarning(newWarning);
    }
  }, [onPerformanceWarning]);
  
  // Optimize performance based on current metrics
  const optimizePerformance = useCallback((warning) => {
    const now = Date.now();
    
    // Prevent optimization spam
    if (now - lastOptimizationRef.current < 5000) {
      return;
    }
    
    lastOptimizationRef.current = now;
    
    const newOptimizations = { ...optimizations };
    let optimized = false;
    
    // Reduce quality based on severity
    if (warning.severity === 'critical') {
      // Aggressive optimizations
      if (newOptimizations.renderQuality !== 'low') {
        newOptimizations.renderQuality = 'low';
        optimized = true;
      }
      if (newOptimizations.particleEffects) {
        newOptimizations.particleEffects = false;
        optimized = true;
      }
      if (newOptimizations.shadows) {
        newOptimizations.shadows = false;
        optimized = true;
      }
      if (newOptimizations.targetFps > 30) {
        newOptimizations.targetFps = 30;
        optimized = true;
      }
    } else if (warning.severity === 'warning') {
      // Moderate optimizations
      if (newOptimizations.renderQuality === 'high') {
        newOptimizations.renderQuality = 'medium';
        optimized = true;
      }
      if (newOptimizations.shadows) {
        newOptimizations.shadows = false;
        optimized = true;
      }
    }
    
    if (optimized) {
      setOptimizations(newOptimizations);
      applyOptimizations(newOptimizations);
      
      if (onPerformanceOptimized) {
        onPerformanceOptimized(newOptimizations);
      }
    }
  }, [optimizations, onPerformanceOptimized]);
  
  // Apply optimizations to game
  const applyOptimizations = useCallback((opts) => {
    if (bridgeRef.current) {
      bridgeRef.current.sendCommand('applyOptimizations', opts);
    }
  }, []);
  
  // Start performance sampling
  const startSampling = useCallback(() => {
    if (samplingIntervalRef.current) {
      return;
    }
    
    samplingIntervalRef.current = setInterval(() => {
      if (bridgeRef.current) {
        // Request performance metrics
        bridgeRef.current.sendCommand('getPerformanceMetrics', {});
      }
    }, sampleInterval);
  }, [sampleInterval]);
  
  // Stop performance sampling
  const stopSampling = useCallback(() => {
    if (samplingIntervalRef.current) {
      clearInterval(samplingIntervalRef.current);
      samplingIntervalRef.current = null;
    }
  }, []);
  
  // Reset performance data
  const reset = useCallback(() => {
    historyRef.current = {
      fps: [],
      latency: [],
      droppedFrames: [],
    };
    trackerRef.current.reset();
    setWarnings([]);
    setMetrics({
      fps: 0,
      avgFps: 0,
      minFps: 60,
      maxFps: 60,
      latency: 0,
      avgLatency: 0,
      maxLatency: 0,
      droppedFrames: 0,
      totalDroppedFrames: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      messageRate: 0,
      performanceScore: 100,
      performanceLevel: 'excellent',
    });
  }, []);
  
  // Force quality settings
  const setQuality = useCallback((quality) => {
    let newOptimizations = {};
    
    switch (quality) {
      case 'high':
        newOptimizations = {
          renderQuality: 'high',
          particleEffects: true,
          shadows: true,
          antialiasing: false,
          targetFps: 60,
        };
        break;
        
      case 'medium':
        newOptimizations = {
          renderQuality: 'medium',
          particleEffects: true,
          shadows: false,
          antialiasing: false,
          targetFps: 60,
        };
        break;
        
      case 'low':
        newOptimizations = {
          renderQuality: 'low',
          particleEffects: false,
          shadows: false,
          antialiasing: false,
          targetFps: 30,
        };
        break;
    }
    
    setOptimizations(newOptimizations);
    applyOptimizations(newOptimizations);
  }, [applyOptimizations]);
  
  // Get performance report
  const getReport = useCallback(() => {
    return {
      metrics,
      optimizations,
      warnings,
      messageMetrics: trackerRef.current.getReport(),
      history: {
        fps: [...historyRef.current.fps],
        latency: [...historyRef.current.latency],
        droppedFrames: [...historyRef.current.droppedFrames],
      },
    };
  }, [metrics, optimizations, warnings]);
  
  return {
    metrics,
    optimizations,
    warnings,
    reset,
    setQuality,
    getReport,
    startSampling,
    stopSampling,
    isOptimizing: autoOptimize,
  };
};

export default useWebViewPerformance;