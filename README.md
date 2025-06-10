# AI Skills Radar & Growth Planner

> 🚀 **Align yourself with market demands** - A comprehensive tool for skill assessment, career planning, and professional development with AI-powered insights.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Features Overview](#-features-overview)  
- [How to Use](#-how-to-use)
- [How the AI Works](#-how-the-ai-works)
- [Sharing & Collaboration](#-sharing--collaboration)
- [Advanced Features](#-advanced-features)
- [Troubleshooting](#-troubleshooting)
- [Coming Soon](#-coming-soon)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 16 or higher) [watch video](https://www.youtube.com/watch?v=Ue6g4udgbdI&pp=0gcJCdgAo7VqN5tD)
- **Google Gemini API Key** (free with Google account)

### Step 1: Get Your Gemini API Key

1. **Visit Google AI Studio**: Go to [https://aistudio.google.com/](https://aistudio.google.com/)
2. **Sign in** with your Google account
3. **Create API Key**: Click "Get API Key" → "Create API Key in new project"
4. **Copy the key** - you'll need this in Step 3

### Step 2: Download and Setup

```bash
# Clone or download the project
cd ai-skills-radar-&-growth-planner

# Install dependencies
npm install
```

### Step 3: Configure API Key

1. **Create environment file**:
   ```bash
   touch .env.local
   ```

2. **Add your API key** (replace `your_api_key_here` with your actual key):
   ```bash
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

   **Alternative method**: Open `.env.local` in any text editor and add:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### Step 4: Run the Application

```bash
# Start the development server
npm run dev
```

🎉 **Success!** Open your browser to the URL shown (usually `http://localhost:5173`)

---

## ✨ Features Overview

### 🎯 **Core Features**
- **AI-Powered Skill Analysis**: Automatic skill identification from your background
- **Interactive Skills Radar**: Visual 12-skill radar with rating comparisons  
- **Multi-Rater Assessment**: Get ratings from colleagues, managers, and peers
- **Growth Planning**: AI-generated development plans with strategic analysis
- **Skill Mastery System**: Track progression and manage skill transitions
- **Universal Growth Enablers**: 6 core soft skills included for everyone

### 🔄 **Skill Management**
- **Intelligent Curation**: Exactly 12 skills optimized for learning focus
- **Skill Swapping**: Replace mastered skills with new growth areas
- **Progress Tracking**: Visual indicators for skill readiness and mastery
- **Data Preservation**: Complete rating history maintained forever

### 📊 **Analytics & Insights**
- **Growth Dimension Analysis**: Breadth, Depth, Reach, and Range strategy
- **Market Alignment**: Suggested job titles based on skill profile
- **Comparative Analysis**: Multi-rater radar visualizations
- **Print-Friendly Reports**: Professional documents for sharing

---

## 🎮 How to Use

### 1. **Initial Setup & Skill Generation**

1. **Enter Your Background**:
   - Hard skills (technologies, tools, certifications)
   - Resume/experience summary  
   - Career aspirations and goals
   - Industry context

2. **AI Analysis**: The system will:
   - Identify your key skills from the input
   - Add 6 Universal Growth Enablers (soft skills)
   - Create detailed rubrics for each skill
   - Generate initial skill candidates

3. **Skill Selection**: Review and confirm your 12-skill radar focus

### 2. **Skills Radar & Assessment**

**Navigate to "Skills Radar & Rubrics" tab**

#### **Add Raters**:
```
- Click "Add Rater" 
- Enter names: "Sarah (Manager)", "John (Peer)", "Tech Lead", etc.
- Add 3-5 raters for best results
```

#### **Rate Skills**:
- **Self-Assessment**: Rate yourself on each skill (Foundational → Expert)
- **Share with Others**: Use the print function to share rubrics
- **Collect Ratings**: Have others assess you using the same rubrics

#### **Compare & Analyze**:
- Toggle raters on/off to compare perspectives
- Enable "Show Average" for overall trends  
- Click radar labels to jump to specific skill rubrics

### 3. **Growth Planning**

**Navigate to "Growth Plan" tab**

1. **Select Focus Skills**: Choose 2-3 skills for development priority
2. **Generate Plans**: AI creates comprehensive development strategies
3. **Review Analysis**: See how each skill contributes to:
   - **Breadth**: Cross-functional versatility
   - **Depth**: Specialized expertise  
   - **Reach**: Expanded responsibility
   - **Range**: Complex, strategic work

### 4. **Skill Mastery Management**

**Advanced users can manage skill progression**:

- **Mastery Criteria**: Self + 3 others rate you Advanced/Expert
- **Mark as Mastered**: Celebrate achievements and remove from active radar
- **Skill Swapping**: Replace mastered skills with new learning areas  
- **Reactivation**: Bring mastered skills back when needed

---

## 🤖 How the AI Works

### **Google Gemini Integration**
The application uses Google's Gemini AI for intelligent analysis:

#### **Skill Identification Process**:
1. **Context Analysis**: Reviews your background, experience, and goals
2. **Market Research**: Considers current industry skill demands  
3. **Skill Mapping**: Identifies relevant technical and soft skills
4. **Rubric Generation**: Creates detailed, personalized skill rubrics

#### **Growth Planning Intelligence**:
1. **Strategic Analysis**: Evaluates skill development impact across 4 dimensions
2. **Personalization**: Tailors recommendations to your career goals
3. **Market Alignment**: Suggests roles matching your skill profile
4. **Learning Pathways**: Provides actionable development strategies

#### **Quality Assurance**:
- **Universal Enablers**: Ensures core soft skills are always included
- **Skill Validation**: Verifies relevance and appropriateness
- **Rubric Quality**: Generates clear, measurable skill levels

---

## 👥 Sharing & Collaboration

### **Current Sharing Method: Print & Share**

Since the application runs locally, use the **Print feature** for collaboration:

#### **For Self-Assessment**:
1. Go to **"Skills Radar & Rubrics"** tab
2. Select **"Self-Assessed"** as active rater  
3. Click **"Print Rubrics & Active Rater Overview"**
4. Save as PDF or print physical copies

#### **For Peer Assessment**:
1. **Share the printed rubrics** with colleagues/managers
2. **Ask them to rate you** on each skill level
3. **Collect their ratings** via email/messaging
4. **Add their ratings** in the app under their rater profile

#### **Professional Sharing**:
- **Career Reviews**: Print comprehensive skill profiles
- **Team Discussions**: Share radar visualizations
- **Development Planning**: Use growth plans in 1:1s
- **Portfolio Evidence**: Include in professional portfolios

### **Rating Collection Process**:

1. **Prepare Materials**:
   ```
   → Print rubrics with clear skill descriptions
   → Include simple rating form (Foundational/Intermediate/Advanced/Expert)  
   → Add deadline for feedback
   ```

2. **Share Instructions**:
   ```
   "Please rate [Your Name] on each skill using the rubric levels.
   Consider their demonstrated capabilities in real work situations.
   Return ratings by [date]."
   ```

3. **Input Collected Ratings**:
   - Add each person as a rater in the app
   - Input their ratings for each skill
   - Generate updated radar and analysis

---

## 🔥 Advanced Features

### **Data Management**
- **Export Data**: Save complete skill profiles as JSON
- **Import Data**: Restore or share complete assessments  
- **Backup**: Regular exports recommended for data safety

### **Customization Options**
- **Theme Toggle**: Light/dark mode support
- **Rater Management**: Add/remove assessors anytime
- **Focus Skills**: Prioritize specific areas for development
- **Comparison Views**: Multi-rater analysis and averages

### **Professional Features**
- **Skill Banking**: Complete skill portfolio management
- **Mastery Tracking**: Achievement recognition and progression
- **Strategic Analysis**: Growth dimension planning
- **Market Insights**: Job role suggestions and alignment

---

## 🛠 Troubleshooting

### **Common Issues**

#### **"API Key Error"**
```bash
# Check your .env.local file exists and contains:
cat .env.local

# Should show: GEMINI_API_KEY=your_key_here
# If not, recreate the file:
echo "GEMINI_API_KEY=your_actual_key" > .env.local
```

#### **"Port Already in Use"**
```bash
# If port 5173 is busy, Vite will automatically try 5174, 5175, etc.
# Check the terminal output for the correct URL
```

#### **"Module Not Found"**
```bash
# Reinstall dependencies:
rm -rf node_modules package-lock.json
npm install
```

#### **"Slow AI Responses"**
- Gemini API has rate limits - wait a moment between requests
- Complex prompts take longer - this is normal
- Check your internet connection

### **Data Issues**

#### **"Lost My Data"**
- Export your data regularly using the Export button
- Check browser localStorage (data persists between sessions)
- Import from a previous export file

#### **"Wrong Skills Generated"**
- Refine your input with more specific details
- Use the skill selection interface to customize
- Add/remove skills manually as needed

---

## 🔮 Coming Soon

### **Phase 2: Enhanced Collaboration** 
> *Currently in planning*

- **🌐 Multi-User Workspace**: Real-time collaborative assessments
- **📱 Mobile App**: Native iOS/Android applications  
- **🔗 Share Links**: Send skill profiles via secure URLs
- **💬 Peer Feedback System**: Structured feedback collection
- **📈 Team Analytics**: Group skill analysis and planning

### **Phase 3: Advanced AI Features**
> *Research phase*

- **🎯 Smart Skill Recommendations**: AI-suggested skill additions
- **📊 Industry Benchmarking**: Compare against market standards
- **🚀 Career Path Mapping**: Multi-step progression planning
- **🤝 Mentor Matching**: Connect with development partners
- **🏆 Achievement System**: Gamified skill development

### **Phase 4: Enterprise Integration**
> *Future roadmap*

- **🏢 HR System Integration**: HRIS and ATS connectivity
- **📋 Performance Review Tools**: Built-in review workflows  
- **🎓 Learning Platform Sync**: Course recommendations and tracking
- **📊 Organization Analytics**: Company-wide skill insights
- **🔐 Enterprise Security**: SSO and advanced permissions

### **Phase 5: Market Intelligence**
> *Vision stage*

- **💼 Job Market Analysis**: Real-time demand tracking
- **💰 Salary Insights**: Skill-based compensation data
- **🌍 Global Benchmarks**: International skill comparisons
- **🔮 Future Skills Prediction**: Emerging skill identification
- **📈 Career ROI Calculator**: Development investment analysis

---

## 🎯 Getting the Most Value

### **Best Practices**

1. **Complete Initial Setup Thoroughly**:
   - Spend time on detailed background input
   - Review generated skills carefully
   - Customize as needed before proceeding

2. **Engage Multiple Raters**:
   - Include diverse perspectives (manager, peers, clients)
   - Provide clear rating instructions
   - Follow up to ensure completion

3. **Regular Updates**:
   - Reassess skills quarterly
   - Update focus areas based on role changes
   - Track progress over time

4. **Action-Oriented Growth Planning**:
   - Set specific development goals
   - Use growth plans in career discussions
   - Monitor skill advancement regularly

### **Professional Tips**

- **Career Reviews**: Use radar prints in performance discussions
- **Team Development**: Share approach with colleagues 
- **Skill Portfolios**: Include in professional documentation
- **Goal Setting**: Align skill development with career objectives

---

**💡 Need Help?** The application includes helpful tooltips, error messages, and guidance throughout the interface. Take your time exploring each section to discover all available features.

**🚀 Ready to Start?** Follow the Quick Start guide above and begin your skill development journey today!
