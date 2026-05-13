# Attendance System Documentation

## Overview

The attendance system is fully integrated with the database and backend, providing real-time attendance tracking for both teachers and students.

## System Architecture

### Backend Components

1. **Database Schema**
   - `attendance_records` table with proper foreign keys
   - Supports statuses: present, absent, late, excused
   - Unique constraint on (student_id, course_id, attendance_date)

2. **Backend Services**
   - `AttendanceController.php` - API endpoints
   - `AttendanceService.php` - Business logic
   - `AttendanceRepository.php` - Database operations

3. **API Endpoints**
   - `POST /api/attendance/bulk` - Bulk mark attendance (Teacher)
   - `GET /api/attendance/course?course_id=X&date=Y` - Get course attendance (Teacher)
   - `GET /api/attendance/student` - Get student attendance (Student/Teacher/Admin)

### Frontend Components

1. **Teacher Attendance Page** (`frontend/src/pages/teacher/Attendance.jsx`)
   - Course/class selection
   - Student list with status buttons
   - Bulk attendance marking
   - Real-time statistics

2. **Student Attendance Page** (`frontend/src/pages/student/Attendance.jsx`)
   - Attendance calendar heatmap
   - Overall statistics
   - Course-wise breakdown
   - Attendance policy information

## Key Features

### Teacher Features
- ✅ Mark attendance for multiple students at once
- ✅ Filter by course and class
- ✅ Add remarks for individual students
- ✅ View existing attendance records
- ✅ Real-time attendance statistics
- ✅ Search students by name
- ✅ Mark all present/absent with one click

### Student Features
- ✅ View personal attendance history
- ✅ Visual calendar heatmap
- ✅ Course-wise attendance breakdown
- ✅ Overall attendance percentage
- ✅ Attendance policy compliance status
- ✅ Empty state handling when no data exists

## Database Integration

The system is fully integrated with the database:

1. **Real Data Storage**: All attendance data is stored in the `attendance_records` table
2. **Foreign Key Constraints**: Proper relationships with users, courses, and teachers
3. **Data Integrity**: Unique constraints prevent duplicate entries
4. **Audit Trail**: Created/updated timestamps for all records

## Testing the System

### 1. Database Setup
```bash
# Run the database schema
mysql -u root -p millennium_db < database/schema.sql
```

### 2. Test System Components
```bash
# Test all system components
php test_attendance_system.php
```

### 3. Seed Sample Data (Optional)
```bash
# Create sample attendance data for testing
php seed_attendance_data.php
```

### 4. Frontend Testing
1. Log in as a teacher
2. Navigate to the Attendance page
3. Select a course and date
4. Mark attendance for students
5. Verify data is saved

6. Log in as a student
7. Navigate to the Attendance page
8. View attendance records and statistics

## API Integration Examples

### Mark Attendance (Teacher)
```javascript
const attendanceData = {
  course_id: 1,
  attendance_date: '2024-05-12',
  records: [
    { student_id: 1, status: 'present', remarks: 'Good work' },
    { student_id: 2, status: 'late', remarks: 'Arrived 10 minutes late' }
  ]
};

await attendanceApi.bulkMark(attendanceData);
```

### Get Student Attendance (Student)
```javascript
const response = await attendanceApi.getStudentAttendance();
const { records, summary } = response.data;
```

## Error Handling

The system includes comprehensive error handling:

1. **Backend Validation**: Validates all input data
2. **Database Error Handling**: Graceful handling of database errors
3. **Frontend Error States**: User-friendly error messages
4. **Notification System**: Optional notifications for absent students

## Troubleshooting

### Common Issues

1. **No Students Showing**
   - Check if students are assigned to the class
   - Verify teacher assignments exist
   - Run: `php test_attendance_system.php`

2. **Attendance Not Saving**
   - Check database connection
   - Verify user permissions
   - Check API endpoint configuration

3. **No Data in Student View**
   - Ensure teachers have marked attendance
   - Check if student is enrolled in courses
   - Run: `php seed_attendance_data.php` to create sample data

### Debug Commands

```bash
# Check database tables
php check_attendance_simple.php

# Test API endpoints
php test_attendance_system.php

# Create sample data
php seed_attendance_data.php
```

## Security Features

1. **Role-Based Access**: Teachers can only mark their assigned courses
2. **Data Validation**: All input data is validated and sanitized
3. **Authentication**: All endpoints require valid authentication
4. **Authorization**: Proper role checking for each operation

## Performance Considerations

1. **Bulk Operations**: Efficient bulk attendance marking
2. **Database Indexes**: Proper indexes on frequently queried columns
3. **Caching**: Frontend caching for better performance
4. **Pagination**: Large datasets are properly paginated

## Future Enhancements

1. **Email Notifications**: Automatic email notifications for parents
2. **Attendance Reports**: Advanced reporting features
3. **Mobile App**: Mobile-friendly attendance marking
4. **Biometric Integration**: Fingerprint/Face recognition support

## Support

For issues or questions:
1. Check the troubleshooting section
2. Run the test scripts to identify problems
3. Verify database setup and permissions
4. Check API logs for detailed error information
