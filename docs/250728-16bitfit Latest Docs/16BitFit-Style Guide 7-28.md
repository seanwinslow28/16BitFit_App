### **1\. Core Philosophy: "Modern Retro"**

Our visual identity is built on a single principle: to evoke the powerful nostalgia of the classic Game Boy era within a modern, performant mobile application. We are not simply copying old designs; we are re-imagining them. The aesthetic should feel like a lovingly restored and upgraded piece of classic hardware. Every design choice, from color to typography, should serve this core philosophy.

### **2\. Color Palette: The "Classic Handheld"**

*This palette is the foundation of our brand. It is divided into two distinct sets: the **UI/Shell Palette** for the app's interface and the **Screen Palette** for the in-game content.*

#### **2.1. UI/Shell Palette**

*Used for all application chrome: backgrounds, buttons, text, and panels.*

* **Shell Light Gray (\#C4BEBB):** The primary background color for all screens. This is the "plastic shell" of our app.  
* **Shell Darker Gray (\#545454):** Used for secondary panels, inactive menu items, or to create depth and separation.  
* **Button Black (\#272929):** The default color for all body text, icons, and outlines. It ensures high contrast and a sharp, "printed-on-plastic" look.  
* **A/B Button Magenta (\#9A2257):** The primary call-to-action color. Reserved for the most important interactive elements (e.g., "START," "BATTLE," "TRAIN").  
* **Screen Border Green (\#84D07D):** A key accent color used exclusively as a border or header background for areas that simulate the "game screen."  
* **Accent Blue (\#5577AA):** Used for secondary button text or less important interactive elements, echoing the classic "GAME BOY™" logo text.

#### **2.2. Green Screen Palette**

*This 4-color palette is **exclusively** for content displayed inside a simulated screen area, such as the character display on the Home Screen and the entire Battle Screen.*

* **Lightest Green (\#9BBC0F):** The default background color for the "screen."  
* **Light Green (\#8BAC0F):** Used for fills, highlights, and secondary details.  
* **Dark Green (\#306230):** Used for primary sprite details and UI elements within the screen.  
* **Darkest Green (\#0F380F):** Used for all outlines, shadows, and text displayed on the "screen."

### **3\. Typography**

* **Primary Typeface:** PressStart2P. This is the sole font for all text in the app to maintain a consistent retro feel.  
* **Typographic Scale (Hierarchy):**  
  * **Screen Title (H1):** 24pt, Button Black.  
  * **Panel Header (H2):** 18pt, Button Black.  
  * **Primary Button Text:** 16pt, Shell Light Gray (on a Magenta button).  
  * **Body Text / Labels:** 12pt, Button Black.  
  * **Sub-labels / Hints:** 10pt, Shell Darker Gray.

### **4\. Component Library**

*This section defines the appearance of our core, reusable UI components.*

* **Buttons:**  
  * **Primary CTA Button:**  
    * **Background:** A/B Button Magenta (\#9A2257).  
    * **Text:** Shell Light Gray (\#C4BEBB).  
    * **Border:** 2px solid Button Black (\#272929).  
    * **Shape:** Square with slightly rounded corners (e.g., 4px radius).  
  * **Secondary Button:**  
    * **Background:** Shell Darker Gray (\#545454).  
    * **Text:** Accent Blue (\#5577AA).  
    * **Border:** 2px solid Button Black (\#272929).  
  * **Disabled State:**  
    * **Background:** Shell Darker Gray (\#545454).  
    * **Text & Border:** Button Black at 40% opacity.  
* **Stat Bars:**  
  * **Container Background:** Shell Darker Gray (\#545454).  
  * **Fill Color:** Accent Blue (\#5577AA).  
  * **Border:** 1px solid Button Black (\#272929).  
  * **Labels:** 12pt Button Black.  
* **Panels & Cards:**  
  * **Background:** Shell Darker Gray (\#545454).  
  * **Border:** 2px solid Button Black (\#272929).  
  * **Padding:** Consistent internal padding (e.g., 16px) must be used for all panels.

### **5\. Iconography & Motion: "Fluid Retro"**

*Our motion philosophy is "Fluid Retro." It combines the sharpness of pixel-perfect assets with the smooth, physics-based animations of modern UI design. The goal is to make the interface feel responsive, intuitive, and delightful to interact with.*

* **Icons:** All icons must be custom-drawn in a sharp, 1-bit or 2-bit pixel art style, primarily using Button Black. They should feel like they were designed for a low-resolution screen.  
* **Motion & Animation Principles:**  
  * **Easing:** Avoid linear motion. Use ease-in-out curves for all animations to create a sense of natural acceleration and deceleration.  
  * **Physics-Based Transitions:** Animations should feel like they have weight and momentum.  
  * **Delightful Micro-interactions:** Small, satisfying animations should reward user actions.  
* **Specific Implementations:**  
  * **Screen Transitions:** Instead of a simple wipe, use a "Pixel Dissolve" or a "Blur Fade." A new screen can slide in with a subtle motion blur, settling into its final position with a gentle bounce. This feels more physical and polished.  
  * **Button Feedback:**  
    * **On Press:** The button should not just scale down. It should subtly depress into the UI, giving the illusion of depth. The inner text/icon should also scale down slightly.  
    * **On Release:** The button should return to its position with a tiny, almost imperceptible overshoot before settling, providing a satisfying "pop."  
  * **Stat Bar Animation:** When a stat increases, the bar should not just fill instantly. It should animate over 300-400ms. As the bar fills, pixelated energy particles should flow from the action button to the bar, culminating in a small flash or glow on the stat bar itself upon completion.  
  * **Notifications & Pop-ups:** Instead of appearing instantly, they should slide smoothly into view from the top or bottom of the screen, gently bouncing as they settle. When dismissed, they slide away with the same fluid motion.