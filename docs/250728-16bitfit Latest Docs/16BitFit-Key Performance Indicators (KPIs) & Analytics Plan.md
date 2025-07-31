### **1\. Guiding Principles**

* **North Star Metric:** **Weekly Active Trainers (WATs)** \- The number of unique users who log at least one workout in a 7-day period. This metric combines activity (logging) and retention (weekly use) and is the truest measure of our app's health.  
* **Focus on Action, Not Vanity:** We will prioritize metrics that reflect user behavior and product validation over simple download counts.  
* **Tooling:** Analytics events will be tracked using a platform like PostHog, Mixpanel, or Amplitude.

### **2\. Key Performance Indicators (KPIs) by Category**

#### **Category 1: Acquisition & Growth**

*Goal: To measure the effectiveness of our Go-to-Market strategy.*

* **KPI 1.1: Install Source Attribution:** A breakdown of downloads by channel (e.g., Organic Search, Reddit Ads, YouTube Influencer). This tells us which channels are most effective.  
* **KPI 1.2: App Store Conversion Rate:** The percentage of users who visit our App Store page and download the app. This measures the effectiveness of our ASO (screenshots, description).

#### **Category 2: Activation & Onboarding**

*Goal: To measure how effectively we guide new users to the "aha\!" moment.*

* **KPI 2.1: Onboarding Funnel Completion Rate:**  
  * Step 1: % of users who select an archetype.  
  * Step 2: % of users who log their first sample activity.  
  * Step 3: % of users who initiate their first battle.  
* **KPI 2.2: Time to First Workout:** The average time it takes a new user to log their first *real* (non-onboarding) workout. A shorter time is better.

#### **Category 3: Retention & Habit Formation**

*Goal: To measure if users are building a lasting habit with 16BitFit. This is our most important category.*

* **KPI 3.1: Day 1, Day 7, Day 30 Retention:** The percentage of users who return to the app on the 1st, 7th, and 30th day after installing.  
* **KPI 3.2: Workout Streak Distribution:** The number of users who have a 3-day, 7-day, and 14-day workout streak. This directly measures habit formation.  
* **KPI 3.3: Churn Rate:** The percentage of users who do not return after a specific period (e.g., 30 days).

#### **Category 4: Engagement & Product Validation**

*Goal: To validate that our core features are fun, engaging, and used as intended.*

* **KPI 4.1: Workouts Logged per WAT:** The average number of workouts logged per Weekly Active Trainer. We aim to see this number increase over time.  
* **KPI 4.2: Battle Engagement Rate:** The percentage of active users who engage in at least one battle per week. This validates our core game loop.  
* **KPI 4.3: Evolution Rate:** The average number of days it takes for an active user to reach the second evolution stage ("Intermediate"). This measures long-term engagement.  
* **KPI 4.4: Feature Adoption:** The percentage of users who use secondary features like "Feed" at least once.

### **3\. Analytics Plan (Events to be Tracked)**

*This is the list of specific events the development team needs to implement in the app's code.*

* **Event Name: app\_installed**  
  * **Properties:** source (e.g., 'organic', 'reddit\_campaign\_1'), device\_type.  
* **Event Name: onboarding\_step\_completed**  
  * **Properties:** step\_number (1, 2, 3), step\_name ('archetype\_selected', 'first\_log', 'first\_battle\_initiated').  
* **Event Name: workout\_logged**  
  * **Properties:** type ('Cardio', 'Strength'), duration\_minutes.  
* **Event Name: meal\_logged**  
  * **Properties:** type ('Healthy', 'Junk Food').  
* **Event Name: battle\_started**  
  * **Properties:** boss\_name ('Training Dummy', 'Sloth Demon', etc.).  
* **Event Name: battle\_completed**  
  * **Properties:** boss\_name, result ('win', 'loss'), player\_health\_remaining.  
* **Event Name: avatar\_evolved**  
  * **Properties:** new\_stage ('Intermediate', 'Advanced', etc.), days\_since\_install.  
* **Event Name: app\_session\_started**  
  * **Properties:** days\_since\_install, current\_streak.