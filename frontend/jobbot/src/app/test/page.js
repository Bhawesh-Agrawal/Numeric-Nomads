"use client";
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Search, Shield, AlertTriangle, CheckCircle, Loader2, Eye, Database, X, MapPin, Clock, Building } from 'lucide-react';

const TestDataPage = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fraudResults, setFraudResults] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState('');
  const [isLoadingCSV, setIsLoadingCSV] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [currentFraudResult, setCurrentFraudResult] = useState(null);
  const [displayedCount, setDisplayedCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load CSV file
  useEffect(() => {
    setIsLoadingCSV(true);
    fetch('/jobs.csv')
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse(text, { 
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true 
        });
        setJobs(parsed.data.filter(job => job.title && job.description));
        setIsLoadingCSV(false);
      })
      .catch((err) => {
        setError('Failed to load CSV data: ' + err.message);
        setIsLoadingCSV(false);
      });
  }, []);

  // Check fraud for a specific job
  const checkFraud = async (job, index) => {
    setLoadingStates(prev => ({ ...prev, [index]: true }));
    setError('');

    const payload = {
      title: job.title || '',
      description: job.description || '',
      company_profile: job.company_profile || '',
      requirements: job.requirements || '',
      telecommuting: parseInt(job.telecommuting) || 0
    };

    try {
      const response = await fetch('https://numeric-nomads.onrender.com/fraud/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error (${response.status})`);
      }
      
      const data = await response.json();
      
      // Add a small delay for better UX
      setTimeout(() => {
        setFraudResults(prev => ({ ...prev, [index]: data }));
        setLoadingStates(prev => ({ ...prev, [index]: false }));
        setCurrentFraudResult({ ...data, jobTitle: job.title });
        setShowFraudModal(true);
      }, 1500);
      
    } catch (err) {
      setError(`Failed to check fraud for "${job.title}": ${err.message}`);
      setLoadingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_profile?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedJobs = filteredJobs.slice(0, displayedCount);
  const hasMoreJobs = displayedCount < filteredJobs.length;

  const loadMoreJobs = () => {
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayedCount(prev => prev + 12);
      setIsLoadingMore(false);
    }, 500);
  };

  // Reset displayed count when search changes
  useEffect(() => {
    setDisplayedCount(12);
  }, [searchTerm]);

  const getFraudStatus = (result) => {
    if (!result) return null;
    const probability = result.probability || result.fraud_probability || 0;
    
    if (probability >= 0.7) {
      return { level: 'High Risk', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: AlertTriangle };
    } else if (probability >= 0.4) {
      return { level: 'Medium Risk', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', icon: AlertTriangle };
    } else {
      return { level: 'Low Risk', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', icon: CheckCircle };
    }
  };

  const JobDetailModal = ({ job, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Company</h4>
              <p className="text-gray-600">{job.company_profile || 'Not specified'}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Description</h4>
              <p className="text-gray-600">{job.description || 'Not specified'}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Requirements</h4>
              <p className="text-gray-600">{job.requirements || 'Not specified'}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Remote Work</h4>
              <p className="text-gray-600">{job.telecommuting === '1' ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const FraudResultModal = ({ result, onClose }) => {
    if (!result) return null;
    
    const fraudStatus = getFraudStatus(result);
    const probability = (result.probability || result.fraud_probability || 0) * 100;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Fraud Analysis Results</h3>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${fraudStatus.bgColor} mb-4`}>
                <fraudStatus.icon className={`w-8 h-8 ${fraudStatus.color}`} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{result.jobTitle}</h4>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${fraudStatus.bgColor} ${fraudStatus.color} ${fraudStatus.borderColor} border`}>
                {fraudStatus.level}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Fraud Probability</span>
                  <span className="text-sm font-bold text-gray-900">{probability.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${probability >= 70 ? 'bg-red-500' : probability >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${probability}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Classification</h5>
                <p className="text-sm text-gray-600">
                  {result.is_fraud ? 'This job posting shows signs of potential fraud.' : 'This job posting appears to be legitimate.'}
                </p>
              </div>

              {probability >= 40 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-800 mb-1">⚠️ Recommendation</h5>
                  <p className="text-sm text-yellow-700">
                    Exercise caution with this job posting. Verify company details and be wary of requests for personal information or upfront payments.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoadingCSV) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Fraud Analyzer</h1>
          <p className="text-gray-600">Analyze job listings for potential fraud using AI detection</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              Showing {displayedJobs.length} of {filteredJobs.length} jobs
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedJobs.map((job, index) => {
            const fraudStatus = getFraudStatus(fraudResults[index]);
            const isLoading = loadingStates[index];

            return (
              <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{job.title}</h3>
                    {fraudResults[index] && (
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${fraudStatus.bgColor} ${fraudStatus.color}`}>
                        <fraudStatus.icon className="w-3 h-3 mr-1" />
                        {fraudStatus.level}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{job.company_profile || 'Company not specified'}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{job.telecommuting === '1' ? 'Remote Work' : 'On-site'}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {job.description?.slice(0, 150) || 'No description available'}...
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    
                    <button
                      onClick={() => checkFraud(job, index)}
                      disabled={isLoading}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Analyze Fraud
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMoreJobs && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreJobs}
              disabled={isLoadingMore}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading more jobs...
                </>
              ) : (
                <>
                  Load More Jobs ({filteredJobs.length - displayedCount} remaining)
                </>
              )}
            </button>
          </div>
        )}

        {displayedJobs.length === 0 && !isLoadingCSV && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No jobs found matching your search.</p>
          </div>
        )}

        {/* Show total count info */}
        {!searchTerm && filteredJobs.length > 0 && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Showing {displayedJobs.length} of {filteredJobs.length} total jobs
            </p>
          </div>
        )}

        {/* Job Detail Modal */}
        {selectedJob && (
          <JobDetailModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
          />
        )}

        {/* Fraud Result Modal */}
        {showFraudModal && currentFraudResult && (
          <FraudResultModal 
            result={currentFraudResult}
            onClose={() => {
              setShowFraudModal(false);
              setCurrentFraudResult(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TestDataPage;