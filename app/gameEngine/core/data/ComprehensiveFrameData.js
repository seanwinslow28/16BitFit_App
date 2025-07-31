/**
 * Comprehensive Frame Data System for 16BitFit
 * Defines all move properties for the fighting game at 60fps
 * Frame data follows fighting game conventions with proper balance
 */

// Frame data types and properties
export const MoveType = {
  NORMAL: 'normal',
  COMMAND: 'command',
  SPECIAL: 'special',
  SUPER: 'super',
  THROW: 'throw',
  UNIVERSAL: 'universal'
};

export const MoveProperty = {
  CANCELLABLE: 'cancellable',
  CHAINABLE: 'chainable',
  ARMOR: 'armor',
  INVINCIBLE: 'invincible',
  PROJECTILE: 'projectile',
  COUNTER: 'counter',
  UNBLOCKABLE: 'unblockable',
  OVERHEAD: 'overhead',
  LOW: 'low',
  CROSSUP: 'crossup'
};

// Universal mechanics (shared across all characters)
export const UniversalMechanics = {
  // Movement
  walkForward: {
    speed: 3.5, // pixels per frame
    acceleration: 0.5
  },
  walkBackward: {
    speed: 2.8, // slightly slower than forward
    acceleration: 0.4
  },
  dash: {
    forward: {
      startup: 3,
      duration: 15,
      recovery: 5,
      distance: 120,
      invincible: false
    },
    backward: {
      startup: 3,
      duration: 12,
      recovery: 7,
      distance: 90,
      invincible: [1, 5] // frames 1-5 invincible
    }
  },
  jump: {
    prejump: 4, // universal prejump frames
    minAirtime: 30,
    maxAirtime: 45,
    landingRecovery: 4,
    doubleJumpWindow: [10, 25] // can double jump between these frames
  },
  
  // Defense
  block: {
    startup: 1,
    chipDamageMultiplier: 0.1,
    pushbackMultiplier: 1.0,
    meterGain: 2 // per blocked hit
  },
  parry: {
    startup: 2,
    activeWindow: 6,
    recovery: 24,
    successBonus: {
      meterGain: 25,
      damageMultiplier: 1.5,
      frameAdvantage: 15
    }
  },
  
  // System mechanics
  hitStop: {
    light: 8,    // frames of hitstop
    medium: 11,
    heavy: 14,
    special: 16,
    super: 20
  },
  pushback: {
    light: 8,
    medium: 12,
    heavy: 18,
    special: 24,
    onBlock: 0.7 // multiplier for blocked attacks
  }
};

// Character-specific frame data
export const CharacterFrameData = {
  // WARRIOR - Balanced character with good normals and uppercut
  warrior: {
    stats: {
      health: 1000,
      walkSpeed: 3.5,
      dashSpeed: 7.0,
      jumpHeight: 12,
      weight: 1.0 // affects juggle physics
    },
    
    normals: {
      // Standing normals
      standingLP: {
        type: MoveType.NORMAL,
        startup: 3,
        active: 3,
        recovery: 7,
        onHit: 3,      // frame advantage on hit
        onBlock: -1,   // frame advantage on block
        damage: 40,
        meterGain: 3,
        properties: [MoveProperty.CHAINABLE],
        cancelInto: ['standingMP', 'standingHP', 'crouchingLK', 'specials'],
        gatlingRoutes: ['5LP > 5MP', '5LP > 2LK']
      },
      
      standingMP: {
        type: MoveType.NORMAL,
        startup: 5,
        active: 4,
        recovery: 11,
        onHit: 5,
        onBlock: 0,
        damage: 70,
        meterGain: 5,
        properties: [MoveProperty.CANCELLABLE],
        cancelInto: ['standingHP', 'specials'],
        hitConfirmWindow: 16 // frames to confirm into special
      },
      
      standingHP: {
        type: MoveType.NORMAL,
        startup: 8,
        active: 5,
        recovery: 18,
        onHit: 2,
        onBlock: -4,
        damage: 120,
        meterGain: 8,
        properties: [MoveProperty.CANCELLABLE],
        cancelInto: ['specials', 'super'],
        crushCounter: {
          onCounterHit: true,
          additionalHitstun: 8,
          wallBounce: true
        }
      },
      
      standingLK: {
        type: MoveType.NORMAL,
        startup: 4,
        active: 3,
        recovery: 9,
        onHit: 2,
        onBlock: -2,
        damage: 45,
        meterGain: 3,
        properties: [MoveProperty.CHAINABLE, MoveProperty.LOW],
        cancelInto: ['standingMK', 'standingHK', 'specials']
      },
      
      standingMK: {
        type: MoveType.NORMAL,
        startup: 7,
        active: 4,
        recovery: 14,
        onHit: 3,
        onBlock: -3,
        damage: 80,
        meterGain: 5,
        properties: [MoveProperty.CANCELLABLE],
        cancelInto: ['specials'],
        moveForward: 15 // pixels moved forward during attack
      },
      
      standingHK: {
        type: MoveType.NORMAL,
        startup: 10,
        active: 6,
        recovery: 20,
        onHit: -2,
        onBlock: -7,
        damage: 130,
        meterGain: 8,
        properties: [],
        knockdown: {
          type: 'hard',
          advantage: 32,
          cornerCarry: 180
        }
      },
      
      // Crouching normals
      crouchingLP: {
        type: MoveType.NORMAL,
        startup: 3,
        active: 2,
        recovery: 8,
        onHit: 2,
        onBlock: 0,
        damage: 35,
        meterGain: 3,
        properties: [MoveProperty.CHAINABLE],
        cancelInto: ['crouchingMP', 'crouchingLK', 'specials']
      },
      
      crouchingMP: {
        type: MoveType.NORMAL,
        startup: 6,
        active: 3,
        recovery: 12,
        onHit: 4,
        onBlock: -1,
        damage: 65,
        meterGain: 5,
        properties: [MoveProperty.CANCELLABLE],
        cancelInto: ['specials'],
        antiAir: {
          hitbox: 'extended_upward',
          airHitAdvantage: 8
        }
      },
      
      crouchingHP: {
        type: MoveType.NORMAL,
        startup: 9,
        active: 4,
        recovery: 19,
        onHit: -3,
        onBlock: -8,
        damage: 110,
        meterGain: 8,
        properties: [MoveProperty.CANCELLABLE],
        cancelInto: ['specials'],
        forcesStand: true // forces standing on hit
      },
      
      crouchingLK: {
        type: MoveType.NORMAL,
        startup: 4,
        active: 2,
        recovery: 9,
        onHit: 3,
        onBlock: -1,
        damage: 40,
        meterGain: 3,
        properties: [MoveProperty.CHAINABLE, MoveProperty.LOW],
        cancelInto: ['crouchingMK', 'specials']
      },
      
      crouchingMK: {
        type: MoveType.NORMAL,
        startup: 6,
        active: 3,
        recovery: 15,
        onHit: 1,
        onBlock: -5,
        damage: 75,
        meterGain: 5,
        properties: [MoveProperty.LOW, MoveProperty.CANCELLABLE],
        cancelInto: ['specials']
      },
      
      crouchingHK: {
        type: MoveType.NORMAL,
        startup: 8,
        active: 4,
        recovery: 22,
        onHit: 'KD',  // knockdown
        onBlock: -12,
        damage: 100,
        meterGain: 8,
        properties: [MoveProperty.LOW],
        knockdown: {
          type: 'soft',
          advantage: 24,
          canQuickRise: true
        }
      },
      
      // Jumping attacks
      jumpingLP: {
        type: MoveType.NORMAL,
        startup: 5,
        active: 6,
        recovery: 8, // until landing
        damage: 45,
        meterGain: 3,
        properties: [MoveProperty.OVERHEAD],
        airToAir: {
          priority: 'medium',
          resetOnHit: true
        }
      },
      
      jumpingMP: {
        type: MoveType.NORMAL,
        startup: 7,
        active: 5,
        recovery: 10,
        damage: 70,
        meterGain: 5,
        properties: [MoveProperty.OVERHEAD, MoveProperty.CROSSUP],
        crossupHitbox: {
          offset: -15, // behind character
          active: [3, 5]
        }
      },
      
      jumpingHP: {
        type: MoveType.NORMAL,
        startup: 9,
        active: 4,
        recovery: 14,
        damage: 100,
        meterGain: 8,
        properties: [MoveProperty.OVERHEAD],
        jumpCancelable: true,
        causesBounce: {
          onCounterHit: true,
          bounceHeight: 200
        }
      },
      
      jumpingLK: {
        type: MoveType.NORMAL,
        startup: 5,
        active: 8,
        recovery: 8,
        damage: 40,
        meterGain: 3,
        properties: [MoveProperty.OVERHEAD],
        floaty: true // less gravity during active frames
      },
      
      jumpingMK: {
        type: MoveType.NORMAL,
        startup: 6,
        active: 5,
        recovery: 11,
        damage: 75,
        meterGain: 5,
        properties: [MoveProperty.OVERHEAD, MoveProperty.CROSSUP]
      },
      
      jumpingHK: {
        type: MoveType.NORMAL,
        startup: 8,
        active: 4,
        recovery: 15,
        damage: 110,
        meterGain: 8,
        properties: [MoveProperty.OVERHEAD],
        causesSpin: {
          onHit: true,
          spinDuration: 20
        }
      }
    },
    
    specials: {
      // Fireball motion (QCF + P)
      fireball: {
        light: {
          type: MoveType.SPECIAL,
          startup: 13,
          active: 999, // until it hits or leaves screen
          recovery: 32,
          damage: 60,
          meterGain: 10,
          onBlock: -2, // when done meaty
          properties: [MoveProperty.PROJECTILE],
          projectileSpeed: 8,
          projectileLife: 120 // frames
        },
        medium: {
          type: MoveType.SPECIAL,
          startup: 13,
          active: 999,
          recovery: 34,
          damage: 70,
          meterGain: 10,
          onBlock: 1,
          properties: [MoveProperty.PROJECTILE],
          projectileSpeed: 10,
          projectileLife: 100
        },
        heavy: {
          type: MoveType.SPECIAL,
          startup: 13,
          active: 999,
          recovery: 36,
          damage: 80,
          meterGain: 10,
          onBlock: 3,
          properties: [MoveProperty.PROJECTILE],
          projectileSpeed: 12,
          projectileLife: 80,
          knockdown: {
            type: 'soft',
            onAirHit: true
          }
        },
        EX: {
          type: MoveType.SPECIAL,
          startup: 11,
          active: 999,
          recovery: 28,
          damage: 120,
          meterCost: 50,
          onBlock: 5,
          properties: [MoveProperty.PROJECTILE],
          projectileSpeed: 14,
          projectileLife: 120,
          hits: 2,
          wallBounce: true
        }
      },
      
      // Dragon Punch motion (DP + P)
      dragonPunch: {
        light: {
          type: MoveType.SPECIAL,
          startup: 3,
          active: 12,
          recovery: 24,
          damage: 100,
          meterGain: 15,
          onBlock: -24,
          properties: [MoveProperty.INVINCIBLE],
          invincibleFrames: [1, 3],
          launchHeight: 180,
          autoCorrect: true // turns to face opponent
        },
        medium: {
          type: MoveType.SPECIAL,
          startup: 4,
          active: 14,
          recovery: 28,
          damage: 120,
          meterGain: 15,
          onBlock: -28,
          properties: [MoveProperty.INVINCIBLE],
          invincibleFrames: [1, 5],
          launchHeight: 220,
          hits: 2
        },
        heavy: {
          type: MoveType.SPECIAL,
          startup: 5,
          active: 16,
          recovery: 32,
          damage: 140,
          meterGain: 15,
          onBlock: -32,
          properties: [MoveProperty.INVINCIBLE],
          invincibleFrames: [1, 7],
          launchHeight: 260,
          hits: 3,
          vacuumEffect: true // pulls opponent in
        },
        EX: {
          type: MoveType.SPECIAL,
          startup: 3,
          active: 20,
          recovery: 20,
          damage: 180,
          meterCost: 50,
          onBlock: -20,
          properties: [MoveProperty.INVINCIBLE],
          invincibleFrames: [1, 15],
          launchHeight: 300,
          hits: 5,
          cornerCarry: 250
        }
      },
      
      // Hurricane Kick motion (QCB + K)
      hurricaneKick: {
        light: {
          type: MoveType.SPECIAL,
          startup: 7,
          active: 16,
          recovery: 14,
          damage: 80,
          meterGain: 12,
          onBlock: -4,
          properties: [],
          hits: 2,
          moveDistance: 120,
          airOK: true
        },
        medium: {
          type: MoveType.SPECIAL,
          startup: 9,
          active: 20,
          recovery: 16,
          damage: 100,
          meterGain: 12,
          onBlock: -6,
          properties: [],
          hits: 3,
          moveDistance: 180,
          airOK: true
        },
        heavy: {
          type: MoveType.SPECIAL,
          startup: 11,
          active: 24,
          recovery: 18,
          damage: 120,
          meterGain: 12,
          onBlock: -8,
          properties: [],
          hits: 4,
          moveDistance: 240,
          airOK: true,
          knockdown: {
            type: 'hard',
            lastHitOnly: true
          }
        },
        EX: {
          type: MoveType.SPECIAL,
          startup: 5,
          active: 30,
          recovery: 12,
          damage: 160,
          meterCost: 50,
          onBlock: -2,
          properties: [MoveProperty.ARMOR],
          armorFrames: [5, 20],
          hits: 5,
          moveDistance: 300,
          airOK: true,
          wallBounce: true
        }
      }
    },
    
    supers: {
      // Super Fireball (QCF QCF + P)
      superFireball: {
        type: MoveType.SUPER,
        startup: 8,
        active: 999,
        recovery: 40,
        damage: 300,
        meterCost: 100,
        onBlock: -5,
        properties: [MoveProperty.PROJECTILE],
        hits: 5,
        cinematicFreeze: 60, // frames of super freeze
        minimumDamage: 150 // damage scaling floor
      },
      
      // Raging Demon (LP LP F LK HP)
      ragingDemon: {
        type: MoveType.SUPER,
        startup: 1,
        active: 2,
        recovery: 60,
        damage: 450,
        meterCost: 100,
        onBlock: null, // unblockable
        properties: [MoveProperty.UNBLOCKABLE, MoveProperty.THROW],
        range: 60,
        cinematicOnHit: true,
        instantKill: false // for dramatic effect
      }
    },
    
    // Character-specific combo routes
    comboRoutes: {
      basic: [
        '2LK > 2LP > 2MP xx Fireball',
        '5MP > 5HP xx Dragon Punch',
        'j.HK > 5HP xx Hurricane Kick'
      ],
      intermediate: [
        '2LK > 2LP > 5LP > 5MP xx EX Hurricane > Dragon Punch',
        'Counter Hit 5HP > dash > 5MP > 5HP xx Super Fireball',
        'j.MP (crossup) > 2LK > 2LP > 2MP xx EX Fireball > Dragon Punch'
      ],
      advanced: [
        'Meaty 5HP > 5MP xx EX Hurricane > 5MP xx EX Dragon Punch',
        '2MP (anti-air) > Dragon Punch > Super Cancel > Super Fireball',
        'Corner: EX Fireball > 5HP xx Hurricane Kick > 2MP xx Dragon Punch'
      ]
    }
  },
  
  // SPEEDSTER - Fast character with mobility and mixups
  speedster: {
    stats: {
      health: 850,
      walkSpeed: 4.5,
      dashSpeed: 9.0,
      jumpHeight: 14,
      weight: 0.85
    },
    
    normals: {
      // Standing normals - Generally faster but less damage
      standingLP: {
        type: MoveType.NORMAL,
        startup: 2,
        active: 2,
        recovery: 6,
        onHit: 4,
        onBlock: 2,
        damage: 30,
        meterGain: 2,
        properties: [MoveProperty.CHAINABLE],
        cancelInto: ['standingMP', 'standingLP', 'crouchingLK', 'specials'],
        rapidFire: true // can chain into itself
      },
      
      standingMP: {
        type: MoveType.NORMAL,
        startup: 4,
        active: 3,
        recovery: 10,
        onHit: 4,
        onBlock: 1,
        damage: 55,
        meterGain: 4,
        properties: [MoveProperty.CANCELLABLE],
        cancelInto: ['standingHP', 'specials']
      },
      
      standingHP: {
        type: MoveType.NORMAL,
        startup: 7,
        active: 4,
        recovery: 16,
        onHit: 0,
        onBlock: -5,
        damage: 90,
        meterGain: 7,
        properties: [MoveProperty.CANCELLABLE],
        cancelInto: ['specials', 'super'],
        spinProperty: {
          causeSpin: true,
          spinDuration: 18
        }
      },
      
      standingLK: {
        type: MoveType.NORMAL,
        startup: 3,
        active: 2,
        recovery: 8,
        onHit: 3,
        onBlock: 0,
        damage: 35,
        meterGain: 2,
        properties: [MoveProperty.CHAINABLE],
        cancelInto: ['standingMK', 'standingHK', 'specials']
      },
      
      standingMK: {
        type: MoveType.NORMAL,
        startup: 6,
        active: 3,
        recovery: 12,
        onHit: 5,
        onBlock: -1,
        damage: 65,
        meterGain: 4,
        properties: [MoveProperty.CANCELLABLE],
        cancelInto: ['specials'],
        hopKick: {
          airborne: [4, 9],
          lowInvulnerable: [4, 9]
        }
      },
      
      standingHK: {
        type: MoveType.NORMAL,
        startup: 9,
        active: 5,
        recovery: 18,
        onHit: -1,
        onBlock: -6,
        damage: 100,
        meterGain: 7,
        properties: [],
        knockback: {
          distance: 200,
          wallSplat: {
            range: 150,
            advantage: 40
          }
        }
      },
      
      // Command normals
      backMP: {
        type: MoveType.COMMAND,
        input: '4MP',
        startup: 8,
        active: 4,
        recovery: 14,
        onHit: 6,
        onBlock: -2,
        damage: 70,
        meterGain: 5,
        properties: [MoveProperty.OVERHEAD, MoveProperty.CANCELLABLE],
        cancelInto: ['specials']
      },
      
      forwardMK: {
        type: MoveType.COMMAND,
        input: '6MK',
        startup: 16,
        active: 3,
        recovery: 12,
        onHit: 4,
        onBlock: -2,
        damage: 80,
        meterGain: 6,
        properties: [MoveProperty.OVERHEAD],
        moveDistance: 80,
        airborne: [8, 20]
      }
    },
    
    specials: {
      // Lightning Legs (QCF + K, mash K)
      lightningLegs: {
        light: {
          type: MoveType.SPECIAL,
          startup: 3,
          active: 'variable', // depends on mashing
          recovery: 12,
          damage: '15x', // per hit
          meterGain: 2, // per hit
          onBlock: -2,
          properties: [],
          mashExtend: {
            maxHits: 8,
            damageScaling: 0.9 // per hit
          }
        },
        medium: {
          type: MoveType.SPECIAL,
          startup: 5,
          active: 'variable',
          recovery: 14,
          damage: '18x',
          meterGain: 2,
          onBlock: -3,
          properties: [],
          mashExtend: {
            maxHits: 10,
            damageScaling: 0.85
          }
        },
        heavy: {
          type: MoveType.SPECIAL,
          startup: 7,
          active: 'variable',
          recovery: 16,
          damage: '20x',
          meterGain: 2,
          onBlock: -4,
          properties: [],
          mashExtend: {
            maxHits: 12,
            damageScaling: 0.8
          },
          ender: {
            damage: 60,
            knockback: 180
          }
        },
        EX: {
          type: MoveType.SPECIAL,
          startup: 3,
          active: 40,
          recovery: 10,
          damage: '25x',
          meterCost: 50,
          onBlock: 2,
          properties: [MoveProperty.ARMOR],
          hits: 10,
          moveForward: 120,
          wallBounce: true
        }
      },
      
      // Spinning Bird Kick (charge D, U + K)
      spinningBirdKick: {
        light: {
          type: MoveType.SPECIAL,
          chargeTime: 45, // frames to charge
          startup: 6,
          active: 20,
          recovery: 20,
          damage: 100,
          meterGain: 12,
          onBlock: -8,
          properties: [MoveProperty.INVINCIBLE],
          invincibleFrames: [1, 8],
          moveDistance: 150,
          hits: 3
        },
        medium: {
          type: MoveType.SPECIAL,
          chargeTime: 45,
          startup: 8,
          active: 24,
          recovery: 22,
          damage: 120,
          meterGain: 12,
          onBlock: -10,
          properties: [MoveProperty.INVINCIBLE],
          invincibleFrames: [1, 10],
          moveDistance: 200,
          hits: 4
        },
        heavy: {
          type: MoveType.SPECIAL,
          chargeTime: 45,
          startup: 10,
          active: 28,
          recovery: 24,
          damage: 140,
          meterGain: 12,
          onBlock: -12,
          properties: [MoveProperty.INVINCIBLE],
          invincibleFrames: [1, 12],
          moveDistance: 250,
          hits: 5,
          knockdown: {
            type: 'hard',
            advantage: 35
          }
        },
        EX: {
          type: MoveType.SPECIAL,
          startup: 5,
          active: 36,
          recovery: 16,
          damage: 180,
          meterCost: 50,
          onBlock: -5,
          properties: [MoveProperty.INVINCIBLE],
          invincibleFrames: [1, 20],
          moveDistance: 300,
          hits: 7,
          vacuumEffect: true
        }
      },
      
      // Instant Air Dash (air only, 66 or 44)
      airDash: {
        forward: {
          type: MoveType.SPECIAL,
          startup: 3,
          duration: 15,
          recovery: 3,
          properties: [],
          speed: 12,
          trajectory: 'horizontal',
          actionable: 8 // can act after 8 frames
        },
        backward: {
          type: MoveType.SPECIAL,
          startup: 3,
          duration: 12,
          recovery: 5,
          properties: [],
          speed: 10,
          trajectory: 'horizontal',
          actionable: 10
        },
        downforward: {
          type: MoveType.SPECIAL,
          input: '236',
          startup: 3,
          duration: 10,
          recovery: 'landing',
          properties: [],
          speed: 14,
          trajectory: 'diagonal_down',
          landingRecovery: 8
        }
      },
      
      // Wall Jump (near wall, 7/8/9)
      wallJump: {
        type: MoveType.SPECIAL,
        startup: 2,
        properties: [],
        trajectory: {
          angle: 45,
          speed: 10,
          height: 200
        },
        wallCling: {
          maxDuration: 30,
          slideSpeed: 2
        }
      }
    },
    
    supers: {
      // Thousand Kicks (QCF QCF + K)
      thousandKicks: {
        type: MoveType.SUPER,
        startup: 4,
        active: 60,
        recovery: 20,
        damage: 280,
        meterCost: 100,
        onBlock: -10,
        properties: [],
        hits: 20,
        moveDistance: 400,
        autoTrack: true,
        cinematicFreeze: 40
      },
      
      // Time Stop (QCB QCB + P)
      timeStop: {
        type: MoveType.SUPER,
        startup: 20,
        active: 180, // 3 seconds
        recovery: 30,
        damage: 0,
        meterCost: 100,
        properties: [],
        effect: {
          slowdownFactor: 0.1, // opponent at 10% speed
          userSpeedMultiplier: 2.0,
          screenEffect: 'grayscale'
        }
      }
    }
  },
  
  // TANK - Heavy character with armor and command grabs
  tank: {
    stats: {
      health: 1200,
      walkSpeed: 2.8,
      dashSpeed: 5.5,
      jumpHeight: 10,
      weight: 1.3
    },
    
    normals: {
      // Standing normals - Slower but more damage and armor
      standingLP: {
        type: MoveType.NORMAL,
        startup: 4,
        active: 3,
        recovery: 9,
        onHit: 2,
        onBlock: -1,
        damage: 50,
        meterGain: 4,
        properties: [MoveProperty.CHAINABLE],
        cancelInto: ['standingMP', 'crouchingLP', 'specials']
      },
      
      standingMP: {
        type: MoveType.NORMAL,
        startup: 7,
        active: 4,
        recovery: 14,
        onHit: 3,
        onBlock: -2,
        damage: 85,
        meterGain: 6,
        properties: [MoveProperty.CANCELLABLE, MoveProperty.ARMOR],
        armorFrames: [3, 7],
        cancelInto: ['standingHP', 'specials']
      },
      
      standingHP: {
        type: MoveType.NORMAL,
        startup: 11,
        active: 6,
        recovery: 22,
        onHit: -1,
        onBlock: -6,
        damage: 150,
        meterGain: 10,
        properties: [MoveProperty.ARMOR],
        armorFrames: [5, 11],
        guardBreak: {
          onBlock: true,
          guardDamage: 30,
          pushback: 100
        }
      },
      
      standingLK: {
        type: MoveType.NORMAL,
        startup: 5,
        active: 3,
        recovery: 11,
        onHit: 1,
        onBlock: -3,
        damage: 55,
        meterGain: 4,
        properties: [MoveProperty.CHAINABLE],
        cancelInto: ['standingMK', 'specials']
      },
      
      standingMK: {
        type: MoveType.NORMAL,
        startup: 8,
        active: 5,
        recovery: 16,
        onHit: 2,
        onBlock: -4,
        damage: 90,
        meterGain: 6,
        properties: [MoveProperty.CANCELLABLE],
        cancelInto: ['specials'],
        pushback: {
          onHit: 150,
          onBlock: 100
        }
      },
      
      standingHK: {
        type: MoveType.NORMAL,
        startup: 13,
        active: 7,
        recovery: 24,
        onHit: 'KD',
        onBlock: -8,
        damage: 160,
        meterGain: 10,
        properties: [MoveProperty.ARMOR],
        armorFrames: [7, 13],
        groundBounce: {
          onHit: true,
          bounceHeight: 150,
          comboExtend: true
        }
      },
      
      // Command normals
      forwardHP: {
        type: MoveType.COMMAND,
        input: '6HP',
        startup: 18,
        active: 4,
        recovery: 20,
        onHit: 4,
        onBlock: -2,
        damage: 120,
        meterGain: 8,
        properties: [MoveProperty.OVERHEAD, MoveProperty.ARMOR],
        armorFrames: [8, 18],
        groundSlam: {
          shockwave: true,
          range: 100
        }
      },
      
      backHK: {
        type: MoveType.COMMAND,
        input: '4HK',
        startup: 14,
        active: 6,
        recovery: 18,
        onHit: 'KD',
        onBlock: -4,
        damage: 130,
        meterGain: 8,
        properties: [MoveProperty.COUNTER],
        counterWindow: [1, 8],
        counterDamage: 200
      }
    },
    
    specials: {
      // Command Grab (360 + P)
      commandGrab: {
        light: {
          type: MoveType.SPECIAL,
          startup: 5,
          active: 3,
          recovery: 24,
          damage: 140,
          meterGain: 15,
          properties: [MoveProperty.THROW, MoveProperty.UNBLOCKABLE],
          range: 60,
          techWindow: 10 // frames to tech
        },
        medium: {
          type: MoveType.SPECIAL,
          startup: 6,
          active: 3,
          recovery: 26,
          damage: 170,
          meterGain: 15,
          properties: [MoveProperty.THROW, MoveProperty.UNBLOCKABLE],
          range: 70,
          techWindow: 8,
          followup: {
            groundPound: true,
            additionalDamage: 30
          }
        },
        heavy: {
          type: MoveType.SPECIAL,
          startup: 7,
          active: 3,
          recovery: 28,
          damage: 200,
          meterGain: 15,
          properties: [MoveProperty.THROW, MoveProperty.UNBLOCKABLE],
          range: 80,
          techWindow: 6,
          wallCarry: 250
        },
        EX: {
          type: MoveType.SPECIAL,
          startup: 4,
          active: 5,
          recovery: 20,
          damage: 250,
          meterCost: 50,
          properties: [MoveProperty.THROW, MoveProperty.UNBLOCKABLE, MoveProperty.ARMOR],
          range: 100,
          techWindow: 0, // untechable
          armorFrames: [1, 9]
        }
      },
      
      // Armor Charge (charge B, F + P)
      armorCharge: {
        light: {
          type: MoveType.SPECIAL,
          chargeTime: 60,
          startup: 10,
          active: 20,
          recovery: 16,
          damage: 100,
          meterGain: 12,
          onBlock: -4,
          properties: [MoveProperty.ARMOR],
          armorFrames: [5, 25],
          moveDistance: 200,
          armorHits: 1
        },
        medium: {
          type: MoveType.SPECIAL,
          chargeTime: 60,
          startup: 12,
          active: 24,
          recovery: 18,
          damage: 130,
          meterGain: 12,
          onBlock: -6,
          properties: [MoveProperty.ARMOR],
          armorFrames: [5, 30],
          moveDistance: 250,
          armorHits: 2
        },
        heavy: {
          type: MoveType.SPECIAL,
          chargeTime: 60,
          startup: 14,
          active: 28,
          recovery: 20,
          damage: 160,
          meterGain: 12,
          onBlock: -8,
          properties: [MoveProperty.ARMOR],
          armorFrames: [5, 35],
          moveDistance: 300,
          armorHits: 3,
          wallBounce: {
            onHit: true,
            cornerOnly: false
          }
        },
        EX: {
          type: MoveType.SPECIAL,
          startup: 8,
          active: 36,
          recovery: 14,
          damage: 200,
          meterCost: 50,
          onBlock: 2,
          properties: [MoveProperty.ARMOR],
          armorFrames: [1, 40],
          moveDistance: 400,
          armorHits: 999, // infinite armor
          projectileReflect: true
        }
      },
      
      // Ground Pound (QCB + P)
      groundPound: {
        light: {
          type: MoveType.SPECIAL,
          startup: 16,
          active: 60,
          recovery: 24,
          damage: 80,
          meterGain: 10,
          onBlock: -10,
          properties: [MoveProperty.LOW],
          shockwaveRange: 150,
          otg: true // hits on the ground
        },
        medium: {
          type: MoveType.SPECIAL,
          startup: 20,
          active: 80,
          recovery: 26,
          damage: 100,
          meterGain: 10,
          onBlock: -12,
          properties: [MoveProperty.LOW],
          shockwaveRange: 200,
          otg: true,
          earthquake: {
            stun: 20,
            stumbleAnimation: true
          }
        },
        heavy: {
          type: MoveType.SPECIAL,
          startup: 24,
          active: 100,
          recovery: 28,
          damage: 120,
          meterGain: 10,
          onBlock: -14,
          properties: [MoveProperty.LOW, MoveProperty.UNBLOCKABLE],
          shockwaveRange: 250,
          otg: true,
          fullscreen: true
        },
        EX: {
          type: MoveType.SPECIAL,
          startup: 12,
          active: 120,
          recovery: 20,
          damage: 150,
          meterCost: 50,
          onBlock: -5,
          properties: [MoveProperty.LOW],
          shockwaveRange: 999,
          otg: true,
          multiHit: {
            waves: 3,
            interval: 20
          }
        }
      },
      
      // Parry Stance (QCF + K)
      parryStance: {
        light: {
          type: MoveType.SPECIAL,
          startup: 4,
          active: 20,
          recovery: 16,
          properties: [MoveProperty.COUNTER],
          counterType: 'high/mid',
          counterDamage: 150,
          counterWindow: [4, 24]
        },
        medium: {
          type: MoveType.SPECIAL,
          startup: 4,
          active: 24,
          recovery: 18,
          properties: [MoveProperty.COUNTER],
          counterType: 'low',
          counterDamage: 150,
          counterWindow: [4, 28]
        },
        heavy: {
          type: MoveType.SPECIAL,
          startup: 4,
          active: 30,
          recovery: 20,
          properties: [MoveProperty.COUNTER, MoveProperty.ARMOR],
          counterType: 'all',
          counterDamage: 200,
          counterWindow: [4, 34],
          armorFrames: [10, 30]
        },
        EX: {
          type: MoveType.SPECIAL,
          startup: 1,
          active: 45,
          recovery: 10,
          meterCost: 50,
          properties: [MoveProperty.COUNTER, MoveProperty.ARMOR],
          counterType: 'all',
          counterDamage: 250,
          counterWindow: [1, 46],
          autoCounter: true,
          damageReflect: 1.5
        }
      }
    },
    
    supers: {
      // Gigantic Pressure (720 + P)
      giganticPressure: {
        type: MoveType.SUPER,
        startup: 2,
        active: 4,
        recovery: 40,
        damage: 400,
        meterCost: 100,
        properties: [MoveProperty.THROW, MoveProperty.UNBLOCKABLE],
        range: 120,
        cinematicThrow: true,
        damageScaling: 0.5 // minimum scaling
      },
      
      // Armor Mode (QCB QCB + K)
      armorMode: {
        type: MoveType.SUPER,
        startup: 10,
        active: 600, // 10 seconds
        recovery: 0,
        damage: 0,
        meterCost: 100,
        properties: [],
        effect: {
          superArmor: true,
          damageReduction: 0.5,
          chipDamageNegation: true,
          speedMultiplier: 1.2,
          damageMultiplier: 1.3
        }
      }
    }
  }
};

// Helper functions for frame data calculations

export function getFrameAdvantage(move, onBlock = false) {
  if (typeof move.onBlock === 'string' || typeof move.onHit === 'string') {
    return move[onBlock ? 'onBlock' : 'onHit']; // Special cases like 'KD'
  }
  return onBlock ? move.onBlock : move.onHit;
}

export function getTotalFrames(move) {
  return move.startup + move.active + move.recovery;
}

export function canLinkInto(move1, move2, onBlock = false) {
  const advantage = getFrameAdvantage(move1, onBlock);
  if (typeof advantage === 'string') return false;
  return advantage >= move2.startup;
}

export function isFrameTrap(move1, move2, onBlock = true) {
  const advantage = getFrameAdvantage(move1, onBlock);
  if (typeof advantage === 'string') return false;
  const gap = move2.startup - advantage;
  return gap > 0 && gap <= 7; // 1-7 frame gap is a frame trap
}

export function calculateHitstun(damage, hitstunBase = 12) {
  // Base hitstun + damage scaling
  return Math.floor(hitstunBase + (damage * 0.1));
}

export function calculateBlockstun(damage, blockstunBase = 8) {
  // Base blockstun + reduced damage scaling
  return Math.floor(blockstunBase + (damage * 0.05));
}

export function getDamageScaling(comboHits) {
  // Progressive damage scaling
  const scalingTable = [
    1.0,   // 1st hit
    1.0,   // 2nd hit
    0.9,   // 3rd hit
    0.8,   // 4th hit
    0.7,   // 5th hit
    0.6,   // 6th hit
    0.5,   // 7th hit
    0.4,   // 8th hit
    0.3,   // 9th hit
    0.2,   // 10th+ hits
  ];
  
  return scalingTable[Math.min(comboHits - 1, scalingTable.length - 1)];
}

export function getGravityScaling(airHits) {
  // Gravity scaling for juggle combos
  return Math.max(0.5, 1.0 - (airHits * 0.1));
}

// Export frame data validation
export function validateFrameData(character, move) {
  const characterData = CharacterFrameData[character];
  if (!characterData) {
    console.error(`Character ${character} not found`);
    return false;
  }
  
  // Check basic frame data properties
  if (!move.startup || !move.active || !move.recovery) {
    console.error('Move missing basic frame data properties');
    return false;
  }
  
  // Validate frame advantage
  const totalFrames = getTotalFrames(move);
  const maxAdvantage = move.active - move.recovery;
  
  if (move.onHit > maxAdvantage + 20) {
    console.warn('Suspiciously high frame advantage on hit');
  }
  
  if (move.onBlock > 5 && !move.properties?.includes(MoveProperty.SPECIAL)) {
    console.warn('Normal move with high block advantage');
  }
  
  return true;
}

export default CharacterFrameData;