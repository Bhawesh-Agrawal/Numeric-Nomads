"use client";
import { useState, useEffect } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, ExternalLink, Briefcase, MapPin, Building, DollarSign, Users, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export default function JobPortal() {
  const [jobTitle, setJobTitle] = useState('data scientist');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);

  const jobOptions = [
    { value: 'developer', label: '💻 Developer', icon: '💻' },
    { value: 'machine learning', label: '🤖 Machine Learning', icon: '🤖' },
    { value: 'data scientist', label: '📊 Data Scientist', icon: '📊' },
    { value: 'data analyst', label: '📈 Data Analyst', icon: '📈' },
    { value: 'software engineer', label: '⚙️ Software Engineer', icon: '⚙️' },
    { value: 'web developer', label: '🌐 Web Developer', icon: '🌐' },
    { value: 'backend developer', label: '🔧 Backend Developer', icon: '🔧' },
    { value: 'frontend developer', label: '🎨 Frontend Developer', icon: '🎨' },
    { value: 'devops engineer', label: '🚀 DevOps Engineer', icon: '🚀' },
    { value: 'cloud architect', label: '☁️ Cloud Architect', icon: '☁️' },
    { value: 'product manager', label: '📋 Product Manager', icon: '📋' },
    { value: 'ai engineer', label: '🧠 AI Engineer', icon: '🧠' },
    { value: 'cyber security analyst', label: '🔒 Cyber Security Analyst', icon: '🔒' },
    { value: 'business analyst', label: '💼 Business Analyst', icon: '💼' }
  ];

  const fetchFraudData = async () => {
    setLoading(true);
    setError(null);
    setExpandedJob(null);
    
    try {
      const url = `https://numeric-nomads.onrender.com/jobs/fraud_detect/?job_title=${encodeURIComponent(jobTitle)}`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (!result || (Array.isArray(result) && result.length === 0)) {
        throw new Error('No job data found for this job title. Try a different search term.');
      }
      
      // Handle both single object and array responses
      const jobsArray = Array.isArray(result) ? result : [result];
      setJobs(jobsArray);
      
    } catch (error) {
      console.error('Error fetching fraud data:', error);
      setError(error.message || 'Failed to fetch job data. Please check your connection and try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudData();
  }, [jobTitle]);

  const getFraudColor = (probability) => {
    if (!probability) return 'text-gray-500';
    if (probability < 0.3) return 'text-green-500';
    if (probability < 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getFraudBgColor = (probability) => {
    if (!probability) return 'bg-gray-50 border-gray-200';
    if (probability < 0.3) return 'bg-green-50 border-green-200';
    if (probability < 0.7) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getFraudStatus = (job) => {
    if (job.is_fraud === true) return { status: 'HIGH RISK', color: 'red', icon: '⚠️' };
    if (job.is_fraud === false) return { status: 'SAFE', color: 'green', icon: '✅' };
    return { status: 'ANALYZING', color: 'gray', icon: '🔍' };
  };

  const toggleJobExpansion = (index) => {
    setExpandedJob(expandedJob === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Real Time Job Fraud Detection
          </h1>
          <p className="text-gray-300 text-lg">
            Protect yourself from fraudulent job postings with AI-powered analysis
          </p>
        </div>

        {/* Job Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-semibold text-white">Select Job Title</h2>
          </div>
          
          <div className="relative">
            <select
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-white/20 backdrop-blur text-white border border-white/30 rounded-xl p-5 pr-12 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer hover:bg-white/25"
            >
              {jobOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <div className="w-3 h-3 border-r-2 border-b-2 border-white/60 transform rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {jobs.length > 0 && !loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-cyan-400 to-purple-500 p-3 rounded-xl">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Found {jobs.length} job{jobs.length !== 1 ? 's' : ''} for "{jobTitle}"
                  </h3>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-300 font-medium">{jobs.filter(job => job.is_fraud).length} High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-300 font-medium">{jobs.filter(job => !job.is_fraud).length} Safe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          {loading && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-4 animate-pulse">
                <Zap className="w-8 h-8 text-white animate-bounce" />
              </div>
              <p className="text-white text-lg font-medium">Analyzing job postings...</p>
              <p className="text-gray-300 text-sm mt-2">Please wait while we scan for potential fraud</p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={fetchFraudData}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          )}

          {jobs.length > 0 && !loading && !error && (
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job, index) => {
                  const fraudStatus = getFraudStatus(job);
                  const isExpanded = expandedJob === index;
                  
                  return (
                    <div key={index} className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 ${
                      fraudStatus.color === 'red' ? 'border-red-200 hover:border-red-300' : 
                      fraudStatus.color === 'green' ? 'border-green-200 hover:border-green-300' : 
                      'border-gray-200 hover:border-gray-300'
                    }`}>
                      {/* Fraud Status Banner */}
                      <div className={`px-6 py-3 ${
                        fraudStatus.color === 'red' ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                        fraudStatus.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                        'bg-gradient-to-r from-gray-500 to-gray-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{fraudStatus.icon}</span>
                            <span className="text-white font-bold text-sm">{fraudStatus.status}</span>
                          </div>
                          {job.fraud_probability !== undefined && (
                            <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                              <span className="text-white font-bold text-sm">
                                {(job.fraud_probability * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Job Card Content */}
                      <div className="p-6">
                        {/* Job Title */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 leading-tight">
                            {job.title || 'No Title Available'}
                          </h3>
                          <div className="flex items-center gap-2 text-blue-600">
                            <Briefcase className="w-4 h-4" />
                            <span className="text-sm font-medium">{job.function || 'General'}</span>
                          </div>
                        </div>

                        {/* Company & Location */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Building className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Company</p>
                              <p className="font-semibold text-gray-800 truncate">{job.company || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <MapPin className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-semibold text-gray-800 truncate">{job.location || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Department</p>
                              <p className="font-semibold text-gray-800 truncate">{job.department || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Salary Range */}
                        {(job.salary_min || job.salary_max) && (
                          <div className="mb-4">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Salary Range</span>
                              </div>
                              <p className="text-green-700 font-bold mt-1">
                                {job.salary_min || 'N/A'} - {job.salary_max || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Description Preview */}
                        <div className="mb-4">
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {job.description || 'No description available'}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => toggleJobExpansion(index)}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                View Details
                              </>
                            )}
                          </button>
                          
                          {job.redirect_url && (
                            <a
                              href={job.redirect_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Apply Now
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t bg-gray-50 p-6 animate-fadeIn">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Job Description
                              </h4>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {job.description || 'No description available'}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Requirements
                              </h4>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {job.requirements || 'No requirements specified'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {jobs.length === 0 && !loading && !error && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Search className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-white/80 text-lg">Select a job title to begin analysis</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Powered by AI • Stay safe while job hunting • Found {jobs.length} results
          </p>
        </div>
      </div>
    </div>
  );
}