import React, { useState, useEffect } from 'react';

const CareerMapper = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would be an API call. 
        // For the prototype, we simulate fetching the enriched JSON.
        const mockData = [
            {
                "id": 1,
                "code": "CS101",
                "name": "Intro to Data Science",
                "description": "Foundations of data analysis, python programming, and statistical modeling.",
                "skills": ["Python", "Data Analysis", "Machine Learning"],
                "real_world_value": {
                    "job_titles": ["Junior Data Scientist", "Data Analyst", "Machine Learning Intern"],
                    "salary_range": "$65,000 - $95,000",
                    "demand": "High"
                }
            },
            {
                "id": 2,
                "code": "ENG202",
                "name": "Modern Rhetoric",
                "description": "Analysis of persuasive communication in digital media and public discourse.",
                "skills": ["Public Relations", "Content Strategy", "Digital Marketing"],
                "real_world_value": {
                    "job_titles": ["Communications Specialist", "Digital Content Strategist", "Public Relations Assistant"],
                    "salary_range": "$45,000 - $70,000",
                    "demand": "Medium"
                }
            },
            {
                "id": 3,
                "code": "BIO305",
                "name": "Molecular Biology",
                "description": "Study of biological activity at the molecular level, including DNA, RNA, and protein synthesis.",
                "skills": ["Biotechnology", "Lab Research", "Genetics"],
                "real_world_value": {
                    "job_titles": ["Lab Technician", "Biotech Research Assistant", "Quality Control Associate"],
                    "salary_range": "$50,000 - $80,000",
                    "demand": "Moderate"
                }
            },
            {
                "id": 4,
                "code": "MKT401",
                "name": "Digital Marketing Analytics",
                "description": "Using data to drive marketing decisions and measure campaign performance.",
                "skills": ["Google Analytics", "SQL", "Market Research"],
                "real_world_value": {
                    "job_titles": ["Marketing Analyst", "Growth Hacker", "SEO Executive"],
                    "salary_range": "$55,000 - $85,000",
                    "demand": "Very High"
                }
            },
            {
                "id": 5,
                "code": "PSY150",
                "name": "Organizational Psychology",
                "description": "Applying psychological principles to workplace productivity and employee well-being.",
                "skills": ["Human Resources", "Conflict Resolution", "Employee Training"],
                "real_world_value": {
                    "job_titles": ["HR Coordinator", "Talent Acquisition Specialist", "Organizational Consultant"],
                    "salary_range": "$50,000 - $75,000",
                    "demand": "Medium-High"
                }
            }
        ];

        setCourses(mockData);
        setLoading(false);
    }, []);

    if (loading) return <div className="p-8 text-white">Loading Career Insights...</div>;

    return (
        <div className="p-8 bg-slate-900 min-h-screen text-slate-100">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                    Student Value Career Mapper
                </h1>
                <p className="text-slate-400 text-lg">Mapping Course Excellence to Market Demand</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => (
                    <div key={course.id} className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                                {course.code}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.real_world_value.demand === 'Very High' ? 'bg-emerald-500/20 text-emerald-300' :
                                    course.real_world_value.demand === 'High' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-500/20 text-slate-300'
                                }`}>
                                {course.real_world_value.demand} Demand
                            </span>
                        </div>

                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                            {course.name}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                            {course.description}
                        </p>

                        <div className="mb-6">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Key Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {course.skills.map(skill => (
                                    <span key={skill} className="px-2 py-1 rounded md bg-slate-800 text-slate-300 text-xs">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">Real-World Value</h4>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {course.real_world_value.salary_range}
                                </div>
                                <div className="text-xs text-slate-500 italic">Projected Entry-Level Salary</div>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">Target Roles</h4>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    {course.real_world_value.job_titles.map(title => (
                                        <li key={title} className="flex items-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mr-2"></span>
                                            {title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CareerMapper;
