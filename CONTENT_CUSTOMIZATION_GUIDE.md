# Portfolio Content Customization Guide

This document lists all the text content in the portfolio that can be customized. Use this as a reference when updating the portfolio with your own information.

---

## 🎯 HERO SECTION (`src/components/Hero/Hero.tsx`)

### Tagline (Small text above heading)

```
Current: "Full Stack Developer • IIIT Kota • Open to opportunities"
```

### Main Heading

```
Current: "I Build Web Apps That Help Businesses Grow"
Note: "Businesses Grow" has gradient animation
```

### Description Paragraph

```
Current: "Computer Science student at IIIT Kota specializing in full-stack development. Built scalable applications serving 100+ concurrent users with optimized performance and modern tech stacks."
```

### Location Widget (Top right corner - desktop only)

```
Status: "SYS:ONLINE"
Location: "LOC:IIIT_KOTA"
Education: "EDU:B.TECH_CSE"
Year: "YR:2022-2026"
```

### Call-to-Action Button

```
Current: "View My Work"
```

---

## 📊 ABOUT SECTION (`src/components/About/About.tsx`)

### Section Label

```
Current: "WHY WORK WITH ME"
```

### Main Heading

```
Current: "You Don't Just Get Code — You Get Results."
Note: Has gradient effect
```

### Description Paragraph

```
Current: "I take your idea from concept to a production-ready product that performs in real-world conditions. Experienced in building scalable MERN applications, optimizing database queries, and implementing secure authentication systems."
```

### Achievement Bullets (3 items)

```
1. "Reduced query latency by 25-35% through optimization"
2. "Built systems handling 100+ concurrent users"
3. "Solved 500+ DSA problems on coding platforms"
```

### Statistics Cards (4 cards)

```
Card 1:
  Coordinate: "[02] YEARS"
  Value: "2+"
  Label: "Experience"

Card 2:
  Coordinate: "[10] PROJ"
  Value: "10+"
  Label: "Projects Built"

Card 3:
  Coordinate: "[500] DSA"
  Value: "500+"
  Label: "Problems Solved"

Card 4:
  Coordinate: "[100] USERS"
  Value: "100+"
  Label: "Concurrent Users"
```

---

## 💼 PROJECTS SECTION (`src/components/Projects/Projects.tsx`)

### Section Header

```
Label: "Selected Work"
Heading: "Projects That Deliver Results"
Note: "Deliver Results" has gradient effect
Description: "Real-world applications built with performance, scalability, and user experience in mind."
```

### Project Cards (4 projects)

#### Project 1: ZTUBE

```
Title: "ZTUBE"
Stack: ["TypeScript", "Next.js", "PostgreSQL", "Cloudinary"]
Impact: "Social media creator platform with 60% media size reduction and 70% faster load times via serverless upload pipeline."
```

#### Project 2: E-Commerce (Scatch)

```
Title: "E-Commerce (Scatch)"
Stack: ["Node.js", "MongoDB", "JWT", "Express"]
Impact: "Scalable REST API handling 100+ concurrent users with 25-35% query latency reduction through optimization."
```

#### Project 3: MyLaundry

```
Title: "MyLaundry"
Stack: ["React", "Node.js", "MongoDB", "RBAC"]
Impact: "Full-stack laundry service app with 95% reduction in database calls and 35-40% faster API responses."
```

#### Project 4: Vaccine Scheduler

```
Title: "Vaccine Scheduler"
Stack: ["DAG Engine", "Node.js", "Razorpay", "Notifications"]
Impact: "DAG-based vaccine scheduling with multi-channel notifications and secure payment integration."
```

---

## 🛠️ EXPERTISE SECTION (`src/App.tsx`)

### Section Header

```
Label: "EXPERTISE"
Heading: "What I Can Build For You."
Description: "From full-stack MERN applications to optimized REST APIs and scalable architectures — production-ready systems built for performance."
```

### Service Cards (3 cards)

```
Card 1:
  Label: "Full Stack Apps"
  Value: "MERN stack with JWT auth & RBAC"

Card 2:
  Label: "API Optimization"
  Value: "25-35% latency reduction"

Card 3:
  Label: "Database Design"
  Value: "MongoDB & PostgreSQL schemas"
```

---

## 📧 CONTACT SECTION (`src/components/Contact/Contact.tsx`)

### Section Header

```
Badge: "Start a Project"
Heading: "Let's Build Something That Matters"
Description: "Currently pursuing B.Tech in CSE at IIIT Kota. Available for internships, freelance projects, and full-time opportunities. Let's discuss how I can help bring your ideas to life."
```

### Info Cards

```
Card 1:
  Label: "Response Time"
  Value: "24h"

Card 2:
  Label: "Status"
  Value: "Available"
```

### Contact Information

```
Email: "dev24prabhakar@gmail.com"
Phone: "+91 8009968319"
```

### Social Links (3 links)

```
1. GitHub: "https://github.com/Devanshprabhakar24"
2. LinkedIn: "https://linkedin.com/in/devansh24prabhakar"
3. LeetCode: "https://leetcode.com"
```

### Form Elements

```
Button Text: "Send Request"
Success Message: "SIGNAL RECEIVED. AWAITING RESPONSE"
Privacy Text: "No spam. Just real conversations."
Signal Strength Label: "Signal Strength"
Signal Status: "STRONG"
```

---

## 🎨 CUSTOMIZATION TIPS

### For GPT/AI Assistants:

When customizing this portfolio, you can:

1. **Replace Personal Information**: Update name, email, phone, location, education details
2. **Update Projects**: Change project titles, tech stacks, and impact descriptions
3. **Modify Statistics**: Update years of experience, project count, problem-solving stats
4. **Change Messaging**: Adjust headings, descriptions, and call-to-action text
5. **Update Links**: Replace social media and portfolio links

### Files to Edit:

- `src/components/Hero/Hero.tsx` - Hero section
- `src/components/About/About.tsx` - About section with stats
- `src/components/Projects/Projects.tsx` - Projects showcase
- `src/components/Contact/Contact.tsx` - Contact form and info
- `src/App.tsx` - Expertise section

### Important Notes:

- Keep gradient text spans intact (they have special styling)
- Maintain responsive text sizing with clamp() functions
- Preserve animation classes and data attributes
- Keep accessibility attributes (aria-labels, etc.)
- Don't modify the 3D scene components unless needed

---

## 📝 EXAMPLE PROMPT FOR GPT

"I want to customize my portfolio. Here's my information:

**Personal Info:**

- Name: [Your Name]
- Email: [your.email@example.com]
- Phone: [Your Phone]
- Location: [Your Location]
- Education: [Your Degree/Institution]
- Status: [Available/Busy/Open to opportunities]

**Professional Summary:**

- Title: [Your Title]
- Years of Experience: [X years]
- Specialization: [Your Focus Area]
- Key Achievement: [Your Main Achievement]

**Projects (provide 3-4):**

1. Project Name: [Name]
   - Tech Stack: [Technologies used]
   - Impact: [What it achieved]

**Statistics:**

- Years Experience: [X]
- Projects Built: [X]
- [Custom Stat]: [X]
- [Custom Stat]: [X]

**Social Links:**

- GitHub: [URL]
- LinkedIn: [URL]
- Other: [URL]

Please update all the text content in the portfolio files to reflect this information."

---

Generated: 2026-04-13
Portfolio Version: 1.0
