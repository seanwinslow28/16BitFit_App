### **Game Design Document: 16bitFit (Tamagotchi Fusion)**

#### **1\. Fused Core Concept**

16bitFit is a "Fitness Pet" RPG that fuses the character progression of a 16-bit fighter with the persistent, real-time care mechanics of a 90s Tamagotchi. Your phone becomes a home for a pixelated fitness avatar whose well-being is directly and constantly tied to your real-life health habits.

It's not enough to just log a workout; you must consistently manage your avatar's **Energy** and **Motivation** throughout the day. If neglected, your fighter will become sluggish, sad, and less effective, demanding your attention just like a classic digital pet. Your goal is to evolve your fighter from a raw **Newbie** to a legendary **Champion** by building and maintaining healthy routines.

#### **2\. The Tamagotchi-fied Gameplay Loop**

The core loop is no longer just about logging and evolving. It's about maintenance, response, and the constant threat of decline.

1. **Needs Deplete:** Throughout the day, your avatar's **Energy** and **Motivation** meters naturally decrease in real-time.  
2. **Attention Signal:** The app sends a notification (the modern "beep") when a meter gets critically low. The avatar's appearance on screen changes to look tired or sad.  
3. **User Response (Logging):** You log a healthy meal to restore **Energy** or a workout to boost **Motivation**.  
4. **Immediate Feedback:** The avatar performs a positive animation (flex, thumbs up), and the meters refill.  
5. **Long-Term Evolution:** Consistent positive responses evolve your avatar into stronger forms. Consistent neglect leads to a "Slump" state.  
6. **Stat Growth:** Your RPG stats (Strength, Endurance) only increase when you log activities while your core "Needs" are met, adding a strategic layer to when you log.

#### **3\. Core Needs & Stats (The Tamagotchi Integration)**

We are adding two primary "Need" meters that function like a Tamagotchi's hunger and happiness. These are separate from your RPG stats.

* **⚡️ Energy Meter (The Hunger Meter):**  
  * **Depletes:** Slowly drains over time, representing daily energy expenditure.  
  * **Replenishes:** Logging a **healthy meal** fills it significantly. Logging **junk food** gives a small, quick burst but causes the meter to drain faster afterward and can make the avatar look "Overeaten."  
  * **Consequence of Neglect:** If it hits zero and stays there, the avatar enters a **"Tired"** state. If neglected for a full day, it becomes **"Sick,"** and logged workouts will yield 0 stat points until you log a healthy meal.  
* **🔥 Motivation Meter (The Happy Meter):**  
  * **Depletes:** Drains when you are inactive for long periods (e.g., 8-12 hours without a logged workout).  
  * **Replenishes:** Logging a **workout** fills it completely.  
  * **Consequence of Neglect:** If this meter is empty, the avatar enters a **"Sad"** state. RPG stats gained from workouts are halved until you boost its motivation.

#### **4\. The Lifecycle & Evolution (Tamagotchi Style)**

The avatar's evolution is now a direct reflection of your consistency in managing its needs.

* **Stage 1: Newbie (Days 1-3):** The avatar is in its base form. Needs deplete faster to encourage frequent initial engagement.  
* **Stage 2: Trainee (Days 4-14):** If care is consistent, the avatar evolves into a more capable-looking Trainee. Needs deplete at a normal rate.  
* **Stage 3: Fighter (Days 15-30):** Long-term consistency unlocks the Fighter evolution, with new gear and confident animations.  
* **Stage 4: Champion (Day 31+):** The peak form, achieved through dedicated care.  
* **Detrimental State: The Slump:** If you consistently let the meters empty for several days, the avatar devolves into a "Slump"—a unique, out-of-shape, sad-looking character. You must then work your way back up by providing consistent care for multiple days to restore its previous form. This replaces the finality of Tamagotchi "death" with a recoverable state.

#### **5\. MVP Sprite States & Triggers**

Here is how your 6 sprites map to this new system:

1. **Default/Idle:** The neutral state. Displayed when Energy and Motivation meters are above 25%.  
2. **Flex/Thumbs Up:** A temporary, celebratory animation that plays immediately after the user successfully logs a workout or a healthy meal.  
3. **Sad:** Triggered when the **Motivation Meter** drops below 25%. The avatar stays in this state until a workout is logged.  
4. **Overeaten:** A temporary animation that plays immediately after logging an unhealthy/junk food item. The avatar may hold its stomach.  
5. **Tired/Sick:** Triggered when the **Energy Meter** drops to 0%. The avatar stays in this state until a healthy meal is logged.  
6. **Determined/Ready:** Displayed when both Energy and Motivation meters are above 90%. The avatar has a focused, ready-to-train expression, signaling to the user that it's the optimal time to log a workout for maximum stat gains.

This fusion turns 16bitFit from a simple tracker with cosmetic changes into a true digital companion. The user feels a sense of responsibility and urgency, which is the magic that made the original Tamagotchi so compelling.