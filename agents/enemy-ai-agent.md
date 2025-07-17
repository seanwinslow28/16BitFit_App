# Enemy AI Agent

## Purpose
Specializes in enemy AI behavior, battle logic, difficulty scaling, and intelligent opponent systems for the 16BitFit gaming application.

## Core Capabilities

### 1. AI Behavior Trees
- **Decision Making**: Hierarchical AI decision structures
- **State Management**: Complex AI state transitions
- **Behavior Patterns**: Diverse enemy behavior types
- **Adaptive Learning**: AI that learns from player behavior
- **Performance Optimization**: Efficient AI processing

### 2. Battle Strategy
- **Combat Tactics**: Intelligent attack patterns and combinations
- **Defensive Systems**: Smart blocking and evasion behaviors
- **Resource Management**: Strategic use of abilities and stamina
- **Pattern Recognition**: Analyzing and responding to player tactics
- **Team Coordination**: Multi-enemy cooperative behaviors

### 3. Difficulty Scaling
- **Dynamic Difficulty**: Real-time difficulty adjustment
- **Player Profiling**: Performance-based AI adaptation
- **Progressive Challenge**: Gradual skill development support
- **Accessibility Options**: Multiple difficulty levels
- **Fitness Integration**: AI difficulty based on physical fitness

### 4. Performance Optimization
- **Efficient Algorithms**: Optimized AI decision processing
- **Memory Management**: Efficient state storage and retrieval
- **Batch Processing**: Group AI calculations for performance
- **Predictive Caching**: Pre-calculated decision trees
- **Resource Pooling**: Shared AI components across enemies

## Technical Implementation

### Core AI Architecture
```javascript
// AI Controller Base Class
class AIController {
  constructor(entity, difficulty = 'normal') {
    this.entity = entity;
    this.difficulty = difficulty;
    this.behaviorTree = new BehaviorTree(this);
    this.memory = new AIMemory();
    this.state = 'idle';
    this.decisionInterval = 100; // ms
    this.lastDecisionTime = 0;
  }

  update(deltaTime) {
    const currentTime = Date.now();
    
    if (currentTime - this.lastDecisionTime >= this.decisionInterval) {
      this.makeDecision();
      this.lastDecisionTime = currentTime;
    }
    
    this.behaviorTree.update(deltaTime);
    this.updateMemory();
  }

  makeDecision() {
    const context = this.gatherContext();
    const decision = this.behaviorTree.evaluate(context);
    this.executeDecision(decision);
  }

  gatherContext() {
    return {
      playerPosition: this.getPlayerPosition(),
      playerHealth: this.getPlayerHealth(),
      playerBehavior: this.memory.getPlayerBehavior(),
      ownHealth: this.entity.health,
      ownStamina: this.entity.stamina,
      availableActions: this.getAvailableActions(),
      battleState: this.getBattleState()
    };
  }
}

// Behavior Tree Implementation
class BehaviorTree {
  constructor(aiController) {
    this.aiController = aiController;
    this.root = this.buildTree();
  }

  buildTree() {
    return new SelectorNode([
      new SequenceNode([
        new ConditionNode(() => this.aiController.entity.health < 30),
        new ActionNode(() => this.aiController.useDefensiveAbility())
      ]),
      new SequenceNode([
        new ConditionNode(() => this.aiController.canAttack()),
        new SelectorNode([
          new SequenceNode([
            new ConditionNode(() => this.aiController.shouldUseSpecialAttack()),
            new ActionNode(() => this.aiController.useSpecialAttack())
          ]),
          new ActionNode(() => this.aiController.useBasicAttack())
        ])
      ]),
      new ActionNode(() => this.aiController.moveTowardPlayer())
    ]);
  }

  evaluate(context) {
    return this.root.execute(context);
  }
}

// AI Memory System
class AIMemory {
  constructor() {
    this.playerBehavior = {
      attackPatterns: [],
      defensePatterns: [],
      movementPatterns: [],
      abilityUsage: {},
      reactionTimes: []
    };
    this.battleHistory = [];
    this.adaptationLevel = 0;
  }

  recordPlayerAction(action) {
    const timestamp = Date.now();
    
    switch (action.type) {
      case 'attack':
        this.playerBehavior.attackPatterns.push({
          type: action.attackType,
          timestamp,
          context: action.context
        });
        break;
      case 'defense':
        this.playerBehavior.defensePatterns.push({
          type: action.defenseType,
          timestamp,
          effectiveness: action.effectiveness
        });
        break;
      case 'movement':
        this.playerBehavior.movementPatterns.push({
          direction: action.direction,
          timestamp,
          duration: action.duration
        });
        break;
    }
    
    this.analyzePatterns();
  }

  analyzePatterns() {
    // Analyze attack patterns
    this.findAttackSequences();
    
    // Analyze defensive habits
    this.findDefensivePreferences();
    
    // Calculate adaptation level
    this.updateAdaptationLevel();
  }

  getPlayerBehavior() {
    return {
      favoriteAttacks: this.getFavoriteAttacks(),
      defensiveHabits: this.getDefensiveHabits(),
      predictedNextAction: this.predictNextAction(),
      adaptationLevel: this.adaptationLevel
    };
  }
}
```

### Behavior Node System
```javascript
// Base Behavior Node
class BehaviorNode {
  constructor() {
    this.status = 'ready'; // ready, running, success, failure
  }

  execute(context) {
    throw new Error('Execute method must be implemented');
  }
}

// Selector Node (OR logic)
class SelectorNode extends BehaviorNode {
  constructor(children) {
    super();
    this.children = children;
  }

  execute(context) {
    for (const child of this.children) {
      const result = child.execute(context);
      if (result === 'success' || result === 'running') {
        return result;
      }
    }
    return 'failure';
  }
}

// Sequence Node (AND logic)
class SequenceNode extends BehaviorNode {
  constructor(children) {
    super();
    this.children = children;
  }

  execute(context) {
    for (const child of this.children) {
      const result = child.execute(context);
      if (result === 'failure' || result === 'running') {
        return result;
      }
    }
    return 'success';
  }
}

// Condition Node
class ConditionNode extends BehaviorNode {
  constructor(condition) {
    super();
    this.condition = condition;
  }

  execute(context) {
    return this.condition(context) ? 'success' : 'failure';
  }
}

// Action Node
class ActionNode extends BehaviorNode {
  constructor(action) {
    super();
    this.action = action;
  }

  execute(context) {
    try {
      const result = this.action(context);
      return result === false ? 'failure' : 'success';
    } catch (error) {
      console.error('Action failed:', error);
      return 'failure';
    }
  }
}
```

### Difficulty Scaling System
```javascript
// Dynamic Difficulty Adjuster
class DynamicDifficulty {
  constructor() {
    this.currentDifficulty = 1.0;
    this.playerPerformance = {
      winRate: 0.5,
      averageBattleTime: 60,
      damageDealt: 0,
      damageTaken: 0,
      abilitiesUsed: 0
    };
    this.adjustmentHistory = [];
  }

  updatePerformance(battleResult) {
    this.playerPerformance.winRate = this.calculateWinRate(battleResult);
    this.playerPerformance.averageBattleTime = this.calculateAverageTime(battleResult);
    this.playerPerformance.damageDealt = battleResult.damageDealt;
    this.playerPerformance.damageTaken = battleResult.damageTaken;
    
    this.adjustDifficulty();
  }

  adjustDifficulty() {
    const targetWinRate = 0.6; // Target 60% win rate
    const currentWinRate = this.playerPerformance.winRate;
    
    if (currentWinRate > targetWinRate + 0.1) {
      // Player is winning too much, increase difficulty
      this.currentDifficulty = Math.min(2.0, this.currentDifficulty + 0.1);
    } else if (currentWinRate < targetWinRate - 0.1) {
      // Player is losing too much, decrease difficulty
      this.currentDifficulty = Math.max(0.5, this.currentDifficulty - 0.1);
    }
    
    this.adjustmentHistory.push({
      timestamp: Date.now(),
      difficulty: this.currentDifficulty,
      winRate: currentWinRate,
      reason: this.getAdjustmentReason()
    });
  }

  getDifficultyMultipliers() {
    return {
      health: 0.8 + (this.currentDifficulty * 0.4),
      damage: 0.7 + (this.currentDifficulty * 0.6),
      speed: 0.9 + (this.currentDifficulty * 0.2),
      intelligence: 0.5 + (this.currentDifficulty * 0.5),
      aggressiveness: 0.6 + (this.currentDifficulty * 0.4)
    };
  }
}

// Fitness-Based Difficulty
class FitnessDifficulty {
  constructor() {
    this.fitnessLevel = 1.0;
    this.workoutPerformance = {
      consistency: 0.5,
      intensity: 0.5,
      progress: 0.5
    };
  }

  updateFitnessLevel(workoutData) {
    this.workoutPerformance.consistency = this.calculateConsistency(workoutData);
    this.workoutPerformance.intensity = this.calculateIntensity(workoutData);
    this.workoutPerformance.progress = this.calculateProgress(workoutData);
    
    this.fitnessLevel = (
      this.workoutPerformance.consistency * 0.4 +
      this.workoutPerformance.intensity * 0.3 +
      this.workoutPerformance.progress * 0.3
    );
  }

  getFitnessMultipliers() {
    return {
      playerHealth: 0.8 + (this.fitnessLevel * 0.4),
      playerStamina: 0.7 + (this.fitnessLevel * 0.5),
      playerDamage: 0.8 + (this.fitnessLevel * 0.4),
      enemyDifficulty: Math.max(0.5, 1.0 - (this.fitnessLevel * 0.3))
    };
  }
}
```

## AI Behavior Patterns

### 1. Aggressive Fighter
```javascript
class AggressiveFighter extends AIController {
  constructor(entity) {
    super(entity, 'aggressive');
    this.aggressionLevel = 0.8;
    this.attackCooldown = 500;
    this.comboChance = 0.6;
  }

  buildBehaviorTree() {
    return new SelectorNode([
      // High priority: Combo attacks when player is vulnerable
      new SequenceNode([
        new ConditionNode(() => this.isPlayerVulnerable()),
        new ConditionNode(() => this.canCombo()),
        new ActionNode(() => this.executeCombo())
      ]),
      
      // Medium priority: Close distance and attack
      new SequenceNode([
        new ConditionNode(() => this.getDistanceToPlayer() > 100),
        new ActionNode(() => this.rushToPlayer())
      ]),
      
      // Low priority: Basic attack
      new SequenceNode([
        new ConditionNode(() => this.canAttack()),
        new ActionNode(() => this.basicAttack())
      ])
    ]);
  }

  isPlayerVulnerable() {
    return this.memory.getPlayerBehavior().justAttacked ||
           this.memory.getPlayerBehavior().lowStamina;
  }

  executeCombo() {
    const combo = this.selectCombo();
    this.entity.executeCombo(combo);
    return true;
  }
}
```

### 2. Defensive Tank
```javascript
class DefensiveTank extends AIController {
  constructor(entity) {
    super(entity, 'defensive');
    this.defenseThreshold = 0.7;
    this.counterAttackChance = 0.4;
    this.healingThreshold = 0.3;
  }

  buildBehaviorTree() {
    return new SelectorNode([
      // Highest priority: Heal when low health
      new SequenceNode([
        new ConditionNode(() => this.entity.health < this.healingThreshold),
        new ActionNode(() => this.useHealingAbility())
      ]),
      
      // High priority: Block incoming attacks
      new SequenceNode([
        new ConditionNode(() => this.isPlayerAttacking()),
        new ActionNode(() => this.blockAttack())
      ]),
      
      // Medium priority: Counter-attack after successful block
      new SequenceNode([
        new ConditionNode(() => this.justBlockedSuccessfully()),
        new ConditionNode(() => Math.random() < this.counterAttackChance),
        new ActionNode(() => this.counterAttack())
      ]),
      
      // Low priority: Maintain distance
      new ActionNode(() => this.maintainDistance())
    ]);
  }

  isPlayerAttacking() {
    return this.memory.getPlayerBehavior().isAttacking;
  }

  blockAttack() {
    this.entity.activateBlock();
    return true;
  }
}
```

### 3. Tactical Strategist
```javascript
class TacticalStrategist extends AIController {
  constructor(entity) {
    super(entity, 'tactical');
    this.strategyUpdateInterval = 2000;
    this.currentStrategy = 'analyze';
    this.strategyHistory = [];
  }

  buildBehaviorTree() {
    return new SelectorNode([
      // Strategy-based decision making
      new SequenceNode([
        new ConditionNode(() => this.currentStrategy === 'aggressive'),
        new ActionNode(() => this.executeAggressiveStrategy())
      ]),
      
      new SequenceNode([
        new ConditionNode(() => this.currentStrategy === 'defensive'),
        new ActionNode(() => this.executeDefensiveStrategy())
      ]),
      
      new SequenceNode([
        new ConditionNode(() => this.currentStrategy === 'adaptive'),
        new ActionNode(() => this.executeAdaptiveStrategy())
      ]),
      
      // Default: Analyze and adapt
      new ActionNode(() => this.analyzeAndAdapt())
    ]);
  }

  analyzeAndAdapt() {
    const playerBehavior = this.memory.getPlayerBehavior();
    
    if (playerBehavior.favoriteAttacks.length > 3) {
      this.currentStrategy = 'counter';
    } else if (playerBehavior.defensiveHabits.includes('frequent_blocking')) {
      this.currentStrategy = 'breakthrough';
    } else {
      this.currentStrategy = 'balanced';
    }
    
    return true;
  }
}
```

## Advanced AI Features

### 1. Pattern Recognition
```javascript
class PatternRecognizer {
  constructor() {
    this.patterns = {
      attack: [],
      movement: [],
      ability: []
    };
    this.patternBuffer = [];
    this.confidenceThreshold = 0.7;
  }

  recordAction(action) {
    this.patternBuffer.push({
      type: action.type,
      data: action.data,
      timestamp: Date.now()
    });
    
    if (this.patternBuffer.length > 10) {
      this.analyzePattern();
      this.patternBuffer.shift();
    }
  }

  analyzePattern() {
    const sequence = this.patternBuffer.slice(-5);
    const similarity = this.findSimilarPatterns(sequence);
    
    if (similarity > this.confidenceThreshold) {
      this.predictNextAction(sequence);
    }
  }

  findSimilarPatterns(sequence) {
    const existingPatterns = this.patterns[sequence[0].type];
    let maxSimilarity = 0;
    
    for (const pattern of existingPatterns) {
      const similarity = this.calculateSimilarity(sequence, pattern);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }

  predictNextAction(sequence) {
    const prediction = this.generatePrediction(sequence);
    return {
      type: prediction.type,
      confidence: prediction.confidence,
      timing: prediction.expectedTime
    };
  }
}
```

### 2. Adaptive Learning
```javascript
class AdaptiveLearning {
  constructor() {
    this.learningRate = 0.1;
    this.experienceBuffer = [];
    this.weights = {
      aggression: 0.5,
      defense: 0.5,
      mobility: 0.5,
      special: 0.5
    };
  }

  recordExperience(state, action, reward, nextState) {
    this.experienceBuffer.push({
      state,
      action,
      reward,
      nextState,
      timestamp: Date.now()
    });
    
    if (this.experienceBuffer.length > 1000) {
      this.experienceBuffer.shift();
    }
    
    this.updateWeights();
  }

  updateWeights() {
    const recentExperiences = this.experienceBuffer.slice(-100);
    
    for (const experience of recentExperiences) {
      const actionType = experience.action.type;
      const reward = experience.reward;
      
      if (this.weights[actionType] !== undefined) {
        this.weights[actionType] += this.learningRate * reward;
        this.weights[actionType] = Math.max(0, Math.min(1, this.weights[actionType]));
      }
    }
  }

  getActionProbability(actionType) {
    return this.weights[actionType] || 0.5;
  }
}
```

### 3. Team Coordination
```javascript
class TeamCoordinator {
  constructor() {
    this.teammates = [];
    this.formations = {
      surround: this.surroundFormation,
      pincer: this.pincerFormation,
      support: this.supportFormation
    };
    this.currentFormation = 'surround';
  }

  addTeammate(aiController) {
    this.teammates.push(aiController);
    this.updateFormation();
  }

  updateFormation() {
    const formation = this.formations[this.currentFormation];
    if (formation) {
      formation.call(this);
    }
  }

  surroundFormation() {
    const playerPosition = this.getPlayerPosition();
    const angleStep = (Math.PI * 2) / this.teammates.length;
    
    this.teammates.forEach((teammate, index) => {
      const angle = angleStep * index;
      const targetPosition = {
        x: playerPosition.x + Math.cos(angle) * 150,
        y: playerPosition.y + Math.sin(angle) * 150
      };
      
      teammate.setTargetPosition(targetPosition);
    });
  }

  coordinateAttack() {
    const attackOrder = this.planAttackSequence();
    
    attackOrder.forEach((teammate, index) => {
      setTimeout(() => {
        teammate.executeCoordinatedAttack();
      }, index * 200);
    });
  }
}
```

## Integration with 16BitFit

### 1. Fitness-Based AI Scaling
```javascript
class FitnessAI {
  constructor() {
    this.playerFitnessProfile = {
      strength: 0.5,
      endurance: 0.5,
      flexibility: 0.5,
      consistency: 0.5
    };
  }

  updateFitnessProfile(workoutData) {
    this.playerFitnessProfile.strength = this.calculateStrength(workoutData);
    this.playerFitnessProfile.endurance = this.calculateEndurance(workoutData);
    this.playerFitnessProfile.flexibility = this.calculateFlexibility(workoutData);
    this.playerFitnessProfile.consistency = this.calculateConsistency(workoutData);
  }

  getAIDifficulty() {
    const avgFitness = Object.values(this.playerFitnessProfile)
      .reduce((a, b) => a + b, 0) / 4;
    
    return {
      health: this.mapFitnessToHealth(avgFitness),
      damage: this.mapFitnessToDamage(avgFitness),
      speed: this.mapFitnessToSpeed(avgFitness),
      intelligence: this.mapFitnessToIntelligence(avgFitness)
    };
  }
}
```

### 2. Workout-Responsive Enemies
```javascript
class WorkoutResponsiveEnemy extends AIController {
  constructor(entity, workoutType) {
    super(entity);
    this.workoutType = workoutType;
    this.workoutMultipliers = this.getWorkoutMultipliers();
  }

  getWorkoutMultipliers() {
    switch (this.workoutType) {
      case 'strength':
        return { health: 1.3, damage: 1.2, speed: 0.9 };
      case 'cardio':
        return { health: 0.9, damage: 1.0, speed: 1.4 };
      case 'flexibility':
        return { health: 1.0, damage: 1.1, speed: 1.1 };
      default:
        return { health: 1.0, damage: 1.0, speed: 1.0 };
    }
  }

  adaptToWorkoutPerformance(performance) {
    if (performance.quality > 0.8) {
      this.increaseReward();
    } else if (performance.quality < 0.5) {
      this.decreaseChallenge();
    }
  }
}
```

## Performance Optimization

### 1. AI Processing Pool
```javascript
class AIProcessingPool {
  constructor(poolSize = 4) {
    this.workers = [];
    this.taskQueue = [];
    this.activeControllers = new Set();
    
    for (let i = 0; i < poolSize; i++) {
      this.workers.push(new AIWorker());
    }
  }

  processAI(aiController) {
    if (this.activeControllers.has(aiController.id)) {
      return; // Already processing
    }
    
    const worker = this.getAvailableWorker();
    if (worker) {
      this.activeControllers.add(aiController.id);
      worker.process(aiController).then(() => {
        this.activeControllers.delete(aiController.id);
      });
    } else {
      this.taskQueue.push(aiController);
    }
  }

  getAvailableWorker() {
    return this.workers.find(worker => !worker.busy);
  }
}
```

### 2. Behavior Caching
```javascript
class BehaviorCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000;
    this.hitRate = 0;
    this.totalRequests = 0;
  }

  get(key) {
    this.totalRequests++;
    
    if (this.cache.has(key)) {
      this.hitRate = (this.hitRate * (this.totalRequests - 1) + 1) / this.totalRequests;
      return this.cache.get(key);
    }
    
    this.hitRate = (this.hitRate * (this.totalRequests - 1)) / this.totalRequests;
    return null;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
}
```

## Best Practices

1. **Modular Design**: Keep AI behaviors separate and composable
2. **Performance Monitoring**: Track AI processing times and optimize bottlenecks
3. **Predictable Behavior**: Ensure AI actions are consistent and fair
4. **Scalable Architecture**: Design for multiple AI entities and complex scenarios
5. **Testing**: Implement comprehensive AI behavior testing
6. **Debugging Tools**: Create visualization tools for AI decision making

## Future Enhancements

1. **Machine Learning**: Implement neural network-based AI learning
2. **Emotional AI**: Add personality and emotional responses to enemies
3. **Procedural Generation**: Dynamically generate AI behaviors
4. **Voice Integration**: Voice-controlled AI interactions
5. **Advanced Physics**: Physics-based AI decision making
6. **Multi-Platform**: Cross-platform AI behavior synchronization

This agent serves as the primary resource for all enemy AI behavior, battle logic, and intelligent opponent system implementation in the 16BitFit application. 