### **1\. Introduction & System Overview**

* **Objective:** This document specifies the technical architecture, technology stack, and implementation strategy for the 16BitFit MVP. The primary technical challenge is the successful integration of a high-performance Phaser 3 fighting game engine within a React Native application.  
* **System Architecture:** We will employ a client-server architecture.  
  * **Client (React Native):** A cross-platform mobile application responsible for all user interface (UI) elements outside of the battle screen, user input, activity logging, and communication with the backend.  
  * **Game Engine (Phaser 3 in WebView):** A self-contained web application running the fighting game. It will be rendered within a WebView component in the React Native client.  
  * **Backend (Supabase):** A Backend-as-a-Service (BaaS) provider to handle user authentication, database storage, and serverless functions.

### **2\. Technology Stack**

* **Frontend (Mobile App):**  
  * **Framework:** React Native (Expo)  
  * **Language:** JavaScript / TypeScript  
  * **Navigation:** React Navigation  
  * **State Management:** React Context API for managing global state like user stats and avatar data.  
  * **WebView Component:** react-native-webview for rendering the Phaser 3 game.  
* **Game Engine (Battle System):**  
  * **Engine:** Phaser 3  
  * **Language:** TypeScript  
  * **Build Tool:** Webpack or Vite to bundle the game into a single, efficient JavaScript file.  
* **Backend:**  
  * **Platform:** Supabase  
  * **Database:** Supabase's integrated PostgreSQL database.  
  * **Authentication:** Supabase Auth for guest/anonymous user management.  
  * **APIs:** Auto-generated RESTful and GraphQL APIs provided by Supabase.  
* **Health Data Integration:**  
  * **iOS:** Apple HealthKit  
  * **Android:** Google Fit  
  * **Abstraction:** Use a React Native library (e.g., react-native-health) to provide a unified API for both platforms.

### **3\. Data Schema (Supabase PostgreSQL)**

*This defines the structure of our primary database tables.*

* **Table: users**  
  * id (UUID, Primary Key, Foreign Key to auth.users)  
  * created\_at (timestamp)  
  * level (integer, default: 1\)  
  * xp (integer, default: 0\)  
* **Table: avatars**  
  * id (UUID, Primary Key)  
  * user\_id (UUID, Foreign Key to users.id)  
  * health (integer, default: 75\)  
  * strength (integer, default: 60\)  
  * stamina (integer, default: 70\)  
  * evolution\_stage (integer, default: 1\)  
  * last\_updated (timestamp)  
* **Table: workouts**  
  * id (UUID, Primary Key)  
  * user\_id (UUID, Foreign Key to users.id)  
  * type (text, e.g., 'Cardio', 'Strength')  
  * created\_at (timestamp)

### **4\. Phaser 3 Integration Plan**

*This is the most critical technical component of the project. The goal is to achieve seamless integration between the React Native shell and the Phaser 3 game.*

* **Step 1: Bundling the Phaser Game**  
  * The Phaser 3 project will be developed as a standard web project.  
  * It will be bundled into a single HTML file (index.html) and a single JavaScript file (game.bundle.js).  
  * These bundled assets will be included locally within the React Native project's assets directory.  
* **Step 2: Rendering the WebView**  
  * The React Native "Battle Screen" will consist of a full-screen WebView component.  
  * The source prop of the WebView will be pointed to the local index.html file.  
  * The WebView must be configured to allow JavaScript execution and communication.  
* **Step 3: Bi-Directional Communication Bridge**  
  * A robust communication layer between React Native and the WebView is essential.  
  * **React Native to Phaser (Passing Stats):**  
    1. When the battle begins, the React Native app will fetch the user's current avatar stats (HP, STR, STA).  
    2. These stats will be serialized into a JSON string.  
    3. The injectedJavaScript prop of the WebView will be used to run a function *inside* the WebView on load, passing this JSON string.  
    4. The Phaser game will have a global function (e.g., window.initializeBattle(stats)) that receives this JSON, parses it, and configures the player's in-game character accordingly.  
  * **Phaser to React Native (Reporting Results):**  
    1. When a battle ends, the Phaser game will determine the outcome ('win' or 'loss').  
    2. It will call window.ReactNativeWebView.postMessage(resultString), where resultString is a JSON string containing the result (e.g., {"result": "win", "xp\_earned": 100}).  
    3. The React Native WebView component will listen for this using the onMessage prop.  
    4. The onMessage handler in React Native will parse the result string and update the user's stats, grant XP, and navigate away from the Battle Screen.  
* **Step 4: Performance & Optimization**  
  * The Phaser game itself must be highly optimized. All assets (spritesheets, audio) will be preloaded during a loading scene within the Phaser game to ensure smooth gameplay.  
  * We must avoid any complex, continuous communication between React Native and the WebView during the fight itself. Data should only be passed at the beginning and end of the battle to maintain 60fps.

### **5\. Risk Analysis & Mitigation**

* **Risk 1: Performance of Phaser in WebView.**  
  * **Mitigation:** Keep the Phaser game simple for the MVP. Use texture atlases for sprites. Profile performance rigorously on mid-range target devices.  
* **Risk 2: Communication Bridge Complexity.**  
  * **Mitigation:** Develop a clear and simple JSON-based contract for messages. Implement thorough error handling for message passing.  
* **Risk 3: Platform-Specific WebView Behavior.**  
  * **Mitigation:** Allocate specific testing time for both iOS and Android to identify and fix any inconsistencies in how the WebView component renders or behaves.