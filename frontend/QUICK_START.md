# Student Dashboard - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- VS Code (recommended)

### Installation

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - Click "Login with Account" button
   - You'll be redirected to `/student/dashboard`

### Project Structure
```
frontend/src/
├── components/
│   ├── layout/           # Sidebar, Header, MainLayout
│   └── common/           # Reusable UI components
├── constants/
│   └── theme.js          # Colors, typography, spacing
├── pages/student/        # Dashboard pages
│   ├── Dashboard.jsx
│   ├── Courses.jsx
│   ├── Assignments.jsx
│   ├── Discussions.jsx
│   ├── Grades.jsx
│   ├── Attendance.jsx
│   └── Notifications.jsx
├── routes/
│   └── StudentRoutes.jsx
└── App.jsx               # Main app with routing
```

## ✨ Key Features Implemented

### 1. **Layout System** ✅
- Fixed sidebar with navigation
- Sticky header with search and notifications
- Responsive drawer on mobile
- Proper spacing and alignment

### 2. **Dashboard Page** ✅
- Welcome hero section with gradient
- 4 quick stat cards with animations
- Today's classes schedule
- Upcoming assignments list
- Recent materials grid
- Performance summary

### 3. **Courses Page** ✅
- Course cards with progress bars
- Course metadata display
- Filter tabs (All/Active/Completed/Archived)
- Hover animations
- Teacher and materials information

### 4. **Assignments Page** ✅
- Assignment cards with status badges
- Status-based filtering
- Action buttons (Submit/Edit/View)
- Teacher feedback display
- Points and score display

### 5. **Discussions Page** ✅
- Topic list with search
- Message thread view
- Real-time reply functionality
- Teacher message highlighting
- Participant tracking

### 6. **Grades Page** ✅
- GPA card with progress
- Subject performance chart (BarChart)
- Grade trend chart (AreaChart)
- Assignment breakdown (PieChart)
- Subject score list
- Teacher feedback section

### 7. **Attendance Page** ✅
- Interactive calendar heatmap
- Attendance statistics cards
- Subject-wise attendance tracking
- Policy information
- Color-coded status indicators

### 8. **Notifications Page** ✅
- Notification center with categorization
- Unread badge counter
- Filter tabs by type
- Quick actions (mark as read, delete)
- Notification icons

## 🎨 Design System

### Colors
- **Primary Blue**: #2563EB
- **Indigo**: #4F46E5
- **Emerald Green**: #10B981
- **Danger Red**: #EF4444
- **Warning Orange**: #F59E0B
- **Background**: #F8FAFC
- **Card**: #FFFFFF

### Typography
- **Heading**: 28px bold
- **Subheading**: 20px semibold
- **Body**: 15-16px
- **Small**: 13px

### Spacing
- **Small**: 0.5rem
- **Medium**: 1rem
- **Large**: 1.5rem
- **Extra Large**: 2rem

### Shadows
- **Soft**: 0 1px 2px
- **Medium**: 0 4px 6px
- **Large**: 0 10px 15px
- **Extra Large**: 0 20px 25px

## 🎬 Animation Details

All animations use Framer Motion:
- **Fade In**: Pages load with smooth opacity transition
- **Slide Up**: Content slides in from bottom
- **Scale**: Cards scale on hover and click
- **Progress**: Progress bars animate width
- **Stagger**: Children animate with delay

## 📱 Responsive Behavior

### Mobile (< 768px)
✅ Sidebar converts to drawer
✅ Cards stack vertically
✅ Touch-friendly sizing (44px+ targets)
✅ Search visible in header
✅ Full-width content

### Tablet (768px - 1024px)
✅ 2-column grids
✅ Sidebar optional
✅ Optimized spacing
✅ Readable text sizes

### Desktop (> 1024px)
✅ Fixed sidebar (64px reserved)
✅ Multi-column grids
✅ Full feature display
✅ Optimal readability

## 🔧 Customization

### Change Primary Color
Edit `src/constants/theme.js`:
```javascript
PRIMARY_BLUE: '#Your-Color-Here'
```

### Add New Navigation Item
Edit `src/components/layout/Sidebar.jsx`:
```javascript
{ icon: YourIcon, label: 'New Page', path: '/student/new-page' }
```

### Modify Animation Speed
Edit any `transition` prop:
```javascript
transition={{ duration: 0.5 }} // Change 0.5 to your value
```

## 🧪 Testing

### Component Testing
```bash
# Create test file
src/pages/student/__tests__/Dashboard.test.jsx

# Run tests
npm run test
```

### Responsive Testing
```bash
# Chrome DevTools
Ctrl + Shift + M  # Toggle device toolbar
```

### Performance Testing
```bash
# Use React DevTools Profiler
# Cmd/Ctrl + Shift + J → Performance tab
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Output
```
dist/
├── assets/
│   ├── js/
│   └── css/
└── index.html
```

### Deploy to Server
```bash
# Copy dist folder to your web server
# Configure your backend API URLs
# Set environment variables
```

## 📚 API Integration

### Connecting to Backend
1. Create `src/services/api.js`:
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api'
});

export const getCourses = () => API.get('/courses');
export const getAssignments = () => API.get('/assignments');
// ... more endpoints
```

2. Update components with real data:
```javascript
const { data: courses } = useQuery('courses', getCourses);
```

## 🔐 Security Considerations

- Add authentication check in `StudentRoutes`
- Store JWT tokens securely
- Validate user permissions for each page
- Add CSRF protection headers
- Sanitize user input

## 🐛 Troubleshooting

### Sidebar not responsive
- Ensure Tailwind is compiled
- Check viewport meta tag in `index.html`
- Verify breakpoint classes are correct

### Animations stuttering
- Reduce animation duration
- Check for CSS conflicts
- Profile with DevTools

### Charts not rendering
- Verify data structure
- Check ResponsiveContainer height
- Ensure Recharts is imported correctly

## 📖 Component Documentation

Each component includes:
- Clear prop types
- Usage examples
- Animation details
- Responsive behavior
- Accessibility features

## ✅ Quality Checklist

Before deployment:
- [ ] All routes working
- [ ] Mobile responsive verified
- [ ] Animations smooth (60fps)
- [ ] No console errors
- [ ] API connected
- [ ] Loading states implemented
- [ ] Error handling in place
- [ ] Accessibility compliant
- [ ] Performance optimized
- [ ] Security reviewed

## 📞 Support & Resources

- **Framer Motion**: https://www.framer.com/motion
- **Tailwind CSS**: https://tailwindcss.com
- **Recharts**: https://recharts.org
- **React**: https://react.dev
- **Lucide Icons**: https://lucide.dev

## 🎯 Next Steps

1. Connect to real API endpoints
2. Implement authentication
3. Add user context
4. Set up state management (Zustand/Redux)
5. Add dark mode toggle
6. Implement real-time updates
7. Add PWA support
8. Performance optimization

---

**Happy Coding! 🎓**

Last Updated: May 9, 2026
