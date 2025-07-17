/**
 * Micro Animations Components
 * Small, delightful animations for UI elements
 * Following MetaSystemsAgent patterns for enhanced UX
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
} from 'react-native';

// Button press animation
export const PressAnimation = ({ 
  children, 
  scale = 0.95,
  duration = 100,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }] }}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      {children}
    </Animated.View>
  );
};

// Bounce animation on mount
export const BounceIn = ({ 
  children, 
  delay = 0,
  duration = 600,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {children}
    </Animated.View>
  );
};

// Fade in animation
export const FadeIn = ({ 
  children, 
  delay = 0,
  duration = 300,
  from = 0,
  to = 1,
}) => {
  const fadeAnim = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(fadeAnim, {
        toValue: to,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

// Slide in animation
export const SlideIn = ({ 
  children, 
  from = 'left',
  delay = 0,
  duration = 400,
  distance = 100,
}) => {
  const translateAnim = useRef(new Animated.Value(
    from === 'left' ? -distance : 
    from === 'right' ? distance : 
    from === 'top' ? -distance : distance
  )).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(translateAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const transform = from === 'left' || from === 'right' 
    ? [{ translateX: translateAnim }]
    : [{ translateY: translateAnim }];

  return (
    <Animated.View style={{ transform }}>
      {children}
    </Animated.View>
  );
};

// Pulse animation (continuous)
export const Pulse = ({ 
  children, 
  minScale = 0.95,
  maxScale = 1.05,
  duration = 1000,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {children}
    </Animated.View>
  );
};

// Shake animation
export const Shake = ({ 
  children, 
  trigger = false,
  intensity = 10,
  duration = 500,
  onComplete = () => {},
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: intensity,
          duration: duration / 6,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -intensity,
          duration: duration / 6,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: intensity * 0.5,
          duration: duration / 6,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -intensity * 0.5,
          duration: duration / 6,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: intensity * 0.25,
          duration: duration / 6,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: duration / 6,
          useNativeDriver: true,
        }),
      ]).start(onComplete);
    }
  }, [trigger]);

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      {children}
    </Animated.View>
  );
};

// Rotate animation
export const Rotate = ({ 
  children, 
  duration = 1000,
  continuous = true,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (continuous) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  return (
    <Animated.View 
      style={{ 
        transform: [{ 
          rotate: rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          })
        }] 
      }}
    >
      {children}
    </Animated.View>
  );
};

// Flip animation
export const Flip = ({ 
  children, 
  trigger = false,
  direction = 'horizontal',
  duration = 600,
  onComplete = () => {},
}) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.timing(flipAnim, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        flipAnim.setValue(0);
        onComplete();
      });
    }
  }, [trigger]);

  const transform = direction === 'horizontal'
    ? [{ 
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        })
      }]
    : [{ 
        rotateX: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        })
      }];

  return (
    <Animated.View style={{ transform }}>
      {children}
    </Animated.View>
  );
};

// Stagger children animations
export const StaggerChildren = ({ 
  children, 
  delay = 100,
  animationType = 'fadeIn',
}) => {
  return React.Children.map(children, (child, index) => {
    const AnimationComponent = 
      animationType === 'fadeIn' ? FadeIn :
      animationType === 'slideIn' ? SlideIn :
      animationType === 'bounceIn' ? BounceIn :
      FadeIn;

    return (
      <AnimationComponent delay={index * delay}>
        {child}
      </AnimationComponent>
    );
  });
};

// Number counter animation
export const AnimatedNumber = ({ 
  value, 
  duration = 1000,
  formatter = (n) => Math.round(n),
  onComplete = () => {},
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    animatedValue.addListener(({ value }) => {
      setDisplayValue(formatter(value));
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(onComplete);

    return () => {
      animatedValue.removeAllListeners();
    };
  }, [value]);

  return <>{displayValue}</>;
};

// Progress bar animation
export const AnimatedProgressBar = ({ 
  progress, 
  duration = 500,
  height = 4,
  backgroundColor = '#92CC41',
  containerColor = 'rgba(146, 204, 65, 0.2)',
  style,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <Animated.View 
      style={[
        {
          height,
          backgroundColor: containerColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height: '100%',
          backgroundColor,
          width: widthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </Animated.View>
  );
};