import React, { useState } from 'react';
import { Search, GraduationCap, User, Calendar, MapPin, ChevronDown, Filter } from 'lucide-react';
// تأكد من المسارات الصحيحة للمكونات
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

// Translated mock data
const mockStudents = [
  {
    id: 'ST-001',
    studentCode: 'STD-2024-001',
    name: 'Ahmed Mohamed Ali',
    grade: 'Primary 3',
    class: '3',
    age: 9,
    guardianName: 'Mohamed Ali Elsayed',
    caseNumber: 'CASE-12345',
    status: 'Active'
  },
  {
    id: 'ST-002',
    studentCode: 'STD-2024-002',
    name: 'Fatima Hassan Mahmoud',
    grade: 'Primary 4',
    class: '4',
    age: 10,
    guardianName: 'Hassan Mahmoud Ahmed',
    caseNumber: 'CASE-12346',
    status: 'Follow-up'
  },
  {
    id: 'ST-003',
    studentCode: 'STD-2024-003',
    name: 'Omar Khaled Youssef',
    grade: 'Primary 2',
    class: '2',
    age: 8,
    guardianName: 'Khaled Youssef Ibrahim',
    caseNumber: 'CASE-12347',
    status: 'Active'
  },
  {
    id: 'ST-004',
    studentCode: 'STD-2024-004',
    name: 'Maryam Saeed Ahmed',
    grade: 'Primary 5',
    class: '5',
    age: 11,
    guardianName: 'Saeed Ahmed Hassan',
    caseNumber: 'CASE-12348',
    status: 'Special Case'
  },
  {
    id: 'ST-005',
    studentCode: 'STD-2024-005',
    name: 'Youssef Abdallah Mohamed',
    grade: 'Primary 3',
    class: '3',
    age: 9,
    guardianName: 'Abdallah Mohamed Salem',
    caseNumber: 'CASE-12349',
    status: 'Active'
  },
  {
    id: 'ST-006',
    studentCode: 'STD-2024-006',
    name: 'Nour Eldin Tarek',
    grade: 'Primary 6',
    class: '6',
    age: 12,
    guardianName: 'Tarek Fahmy Ali',
    caseNumber: 'CASE-12350',
    status: 'Follow-up'
  },
  {
    id: 'ST-007',
    name: 'Sarah Ahmed Mohamed',
    grade: 'Prep 1',
    class: '7',
    age: 13,
    guardianName: 'Ahmed Mohamed Hassan',
    caseNumber: 'CASE-12351',
    status: 'Active'
  },
  {
    id: 'ST-008',
    name: 'Mohamed Abdelrahman',
    grade: 'Prep 2',
    class: '8',
    age: 14,
    guardianName: 'Abdelrahman Salem',
    caseNumber: 'CASE-12352',
    status: 'Follow-up'
  },
  {
    id: 'ST-009',
    name: 'Laila Hossam',
    grade: 'Secondary 1',
    class: '10',
    age: 16,
    guardianName: 'Hossam Mahmoud',
    caseNumber: 'CASE-12353',
    status: 'Active'
  },
  {
    id: 'ST-010',
    name: 'Karim Samy',
    grade: 'Primary 1',
    class: '1',
    age: 7,
    guardianName: 'Samy Ahmed',
    caseNumber: 'CASE-12354',
    status: 'Active'
  }
];

export function StudentsSearchScreen({ onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  const grades = ['All', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'Prep 1', 'Prep 2', 'Prep 3', 'Secondary 1', 'Secondary 2', 'Secondary 3'];
  const classes = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'All' || student.grade === selectedGrade;
    const matchesClass = selectedClass === 'All' || student.class === selectedClass;
    return matchesSearch && matchesGrade && matchesClass;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Follow-up':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Special Case':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6" dir="ltr">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 shadow-lg mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl mb-2">Student Search</h1>
          <p className="text-sm opacity-80">Search for students registered at school</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        {/* Search and Filters */}
        <Card className="p-6 mb-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Box */}
            <div className="relative">
              <label className="block text-sm text-muted-foreground mb-2">
                Student Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for a student..."
                  className="w-full pr-4 pl-10 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Grade Dropdown */}
            <div className="relative">
              <label className="block text-sm text-muted-foreground mb-2">
                Grade
              </label>
              <button
                onClick={() => {
                  setShowGradeDropdown(!showGradeDropdown);
                  setShowClassDropdown(false);
                }}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <span>{selectedGrade}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
              {showGradeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {grades.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => {
                        setSelectedGrade(grade);
                        setShowGradeDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors ${selectedGrade === grade ? 'bg-primary/10 text-primary font-medium' : ''
                        }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Class Dropdown */}
            <div className="relative">
              <label className="block text-sm text-muted-foreground mb-2">
                Class No.
              </label>
              <button
                onClick={() => {
                  setShowClassDropdown(!showClassDropdown);
                  setShowGradeDropdown(false);
                }}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <span>{selectedClass}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
              {showClassDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {classes.map((className) => (
                    <button
                      key={className}
                      onClick={() => {
                        setSelectedClass(className);
                        setShowClassDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors ${selectedClass === className ? 'bg-primary/10 text-primary font-medium' : ''
                        }`}
                    >
                      {className}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Results found: <span className="font-semibold text-primary">{filteredStudents.length}</span> out of {mockStudents.length} students
            </p>
          </div>
        </Card>

        {/* Students List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="p-5 bg-card border-border hover:shadow-lg transition-shadow">
              {/* Student Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{student.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{student.studentCode}</p>
                  </div>
                </div>
                <Badge className={`text-xs ${getStatusColor(student.status)}`}>
                  {student.status}
                </Badge>
              </div>

              {/* Student Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{student.grade}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{student.class}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Age: {student.age} years</span>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Guardian</p>
                <p className="text-sm font-medium mb-1">{student.guardianName}</p>
                <p className="text-xs text-muted-foreground">Case: {student.caseNumber}</p>
              </div>

              {/* Action Button */}
              <Button
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {/* Handle view details */ }}
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredStudents.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Could not find any students matching the search criteria
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}