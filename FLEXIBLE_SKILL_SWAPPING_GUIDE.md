# 🔄 Flexible Skill Swapping System Guide

## Overview

The enhanced skill swapping system allows you to freely manage your active skills without requiring mastery criteria. This provides maximum flexibility for exploring different skill combinations based on your learning journey and career goals.

## How It Works

### 🎯 **Core Concept**
- **AI generates more skills than your active limit** (e.g., 14 skills generated, 6-12 active on radar)
- **All skill data is preserved** - rubrics, ratings, and descriptions for every generated skill
- **Free swapping anytime** - swap active skills without mastery requirements
- **Separate mastery tracking** - mastery is optional and tracks achievement, not access

### 🔧 **Skill Bank Structure**
```typescript
{
  activeSkills: string[];      // Skills visible on radar (max 12)
  masteredSkills: string[];    // Skills marked as mastered
  allSkillsData: SkillData[];  // Complete data for ALL generated skills
}

// Skill Status Types
ACTIVE = "active"           // Currently visible in radar/lists
INACTIVE = "inactive"       // Available for swapping but not on radar  
MASTERED = "mastered"       // Achieved mastery, can be toggled back
ARCHIVED = "archived"       // Completely archived (future feature)
```

## 🚀 **How to Swap Skills**

### **Step 1: Access Skill Management**
1. Go to **🎯 Skills Radar** tab
2. Look for the **🔄 Skill Management** section in each skill rubric card
3. Every active skill has a swap button available

### **Step 2: Initiate Swap**
1. Click **"Swap Skill"** button (blue button in management section)
2. A dropdown appears showing all available skills from your skill bank
3. **No mastery requirements** - swap anytime you want

### **Step 3: Choose Replacement**
1. Browse through available skills in the dropdown
2. Each option shows:
   - **Skill name**
   - **Brief description**
   - All preserved rating data
3. Click any skill to immediately replace the current one

### **Step 4: Confirm Changes**
- The swap happens **instantly**
- Old skill becomes **INACTIVE** (preserved in skill bank)
- New skill becomes **ACTIVE** (visible on radar)
- All rating data is maintained for both skills

## 🎨 **User Interface Features**

### **In Each Skill Rubric Card:**
```
┌─────────────────────────────────────┐
│ 📝 Skill Name                       │
│ Category • Universal Enabler        │
│                                     │
│ [Rubric levels with ratings...]     │
│                                     │
│ ┌─── 🔄 Skill Management ─────┐    │
│ │ Swap this skill with any     │    │
│ │ other from your skill bank   │    │
│ │                   [Swap Skill] │  │
│ └─────────────────────────────────┘  │
│                                     │
│ ┌─── ✓ Mastery Status ──────────┐   │
│ │ [Mastery progress/actions...]  │   │
│ └─────────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 📋 **Benefits of This Approach**

### **🎯 Flexibility**
- **Experiment freely** - try different skill combinations
- **No penalties** - swap without losing progress
- **Career alignment** - adjust skills based on job requirements
- **Learning priorities** - focus on what matters most right now

### **📊 Data Preservation**
- **All ratings maintained** - never lose assessment data
- **Complete skill bank** - access to all AI-generated skills
- **Historical tracking** - see your journey across all skills
- **Rubric integrity** - detailed descriptions always available

### **🎨 User Experience**
- **Simple workflow** - one-click swapping
- **Clear visual design** - separate management from mastery
- **Immediate feedback** - instant updates to radar
- **Accessible anytime** - no restrictive prerequisites

## 🔍 **Example Workflow**

1. **AI generates 14 skills** for your role/background
2. **Choose 6-8 initial skills** to focus on
3. **Rate yourself and get others' input** on active skills
4. **Discover you need different skills** for a new opportunity
5. **Swap 2-3 skills** with others from your skill bank
6. **Continue rating and assessment** on new skill set
7. **Mark skills as mastered** when criteria are met (optional)
8. **Repeat as needed** for different career phases

## 🛠️ **Technical Implementation**

### **Key Functions:**
- `handleSwapSkill(removeSkillId, addSkillId)` - Free swapping logic
- `getAvailableSkillsForSwap()` - Returns all non-active skills
- Skill status management with `INACTIVE` state
- Preserved rating data across all skill states

### **Data Flow:**
```
AI Generation → Skill Bank (all skills) → Active Selection → Rating/Assessment → Flexible Swapping → Mastery Tracking
```

This system provides the perfect balance of structure and flexibility, allowing you to adapt your skill focus while maintaining all your assessment progress.
