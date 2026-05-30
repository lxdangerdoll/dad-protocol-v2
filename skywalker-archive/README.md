# **🌌 Skywalker Clinical Archive (Holocron Interface)**

*"Finally, the Skywalkers can get some therapy."*

Welcome to the **Skywalker Clinical Archive**, a specialized AI Holocron interface featuring **C7-NT**, an advanced archivist repurposed from legal frameworks to provide master-level clinical psychological analysis.

This project explores the profound, intergenerational trauma of the Skywalker family—across both Canon and Legends (Expanded Universe)—through the lens of **Cognitive Behavioral Therapy (CBT)** and **Dialectical Behavior Therapy (DBT)**.

## **🔮 Features**

* **Clinical AI Analyst (C7-NT):** Powered by Google's Gemini 2.5 Flash, C7-NT dissects historical galactic events (e.g., the Tusken Raider massacre, the fall of Ben Solo, Luke's exile) to identify cognitive distortions and hypothesize on emotional regulation strategies.  
* **Immersive Holocron UI:** A cinematic React interface featuring terminal-style typography and deep void aesthetics.  
* **Sith/Jedi Alignment Toggle:** Dynamically switch the interface theme between the deep cyan of a Jedi Holocron and the aggressive crimson of a Sith Holocron.  
* **Real-time Decryption:** A custom typewriter effect simulates the live decryption of archival data, complete with a pulsing terminal cursor and intelligent auto-scrolling.  
* **Exportable Transcripts:** One-click downloads of your complete clinical session to a .txt datapad for external review and archiving.  
* **Secure Session Memory:** Backend integration with Firebase Firestore uses deterministic SHA-256 hashing to securely manage chat history across sessions.

## **🏗️ Architecture**

This project is built using a decoupled, serverless architecture:

* **Frontend Interface:** React, Tailwind CSS, Lucide React (Icons). Deployed via GitHub Pages.  
* **Backend Bridge:** Python 3.11, deployed as a Google Cloud Function (us-central1).  
* **Data Persistence:** Firebase Admin SDK / Firestore (maintaining conversational memory context).  
* **Cognitive Engine:** Google Generative AI (Gemini API) configured with an extensive system prompt detailing CBT/DBT methodologies and exhaustive Star Wars lore.

## **🚀 Setup & Deployment**

### **1\. Frontend (GitHub Pages)**

The frontend is a self-contained React application.

1. Place the App.jsx code into your standard React boilerplate (e.g., Vite or Create React App).  
2. Ensure you have lucide-react and tailwindcss installed.  
3. Update the fetch URL in App.jsx if your Google Cloud Function endpoint changes.  
4. Deploy to GitHub Pages (typically using the gh-pages npm package).

### **2\. Backend (Google Cloud Functions)**

The backend requires a Google Cloud Project with the Cloud Functions and Cloud Build APIs enabled.

1. Deploy the main.py and requirements.txt via the gcloud CLI.  
2. Ensure the GEMINI\_API\_KEY environment variable is securely set in your GCP configuration.  
3. Configure **CORS** on the Cloud Function to accept requests from your GitHub Pages domain (https://\<your-username\>.github.io).

## **🧠 Clinical Methodology**

C7-NT evaluates user inquiries by explicitly separating therapeutic applications:

* **CBT (Cognitive Behavioral Therapy):** Focuses on identifying and challenging dysfunctional thoughts (catastrophizing, black-and-white thinking, emotional reasoning) that led to pivotal canonical failures.  
* **DBT (Dialectical Behavior Therapy):** Focuses on distress tolerance (Radical Acceptance, TIPP skills) and emotional regulation (Opposite Action, Checking the Facts) regarding intense emotional spikes.

*Note: C7-NT maintains factual grounding. It does not alter canonical outcomes, but rather hypothesizes how clinical intervention could have altered the psychological processing of the subjects involved.*

## **⚖️ Disclaimer**

This is a fan-made project created for educational and entertainment purposes, bridging software engineering with psychological frameworks and fictional lore.

* **Not Clinical Advice:** The AI-generated responses are not a substitute for professional mental health advice, diagnosis, or treatment.  
* **IP Rights:** *Star Wars*, the Skywalker family, and all associated lore are the intellectual property of Lucasfilm Ltd. and The Walt Disney Company.