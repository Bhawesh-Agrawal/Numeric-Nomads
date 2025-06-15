"use client"

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Shield, Loader2, Eye, EyeOff } from 'lucide-react';

const FraudCheckForm = () => {
  const [job, setJob] = useState({
    title: '',
    location: '',
    department: '',
    salaryRange: '',
    company_profile: '',
    description: '',
    requirements: '',
    benefits: '',
    telecommuting: '0',
    employmentType: '',
    requiredExperience: '',
    education: '',
    role: ''
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Required fields for the API
  const requiredFields = ['title', 'description', 'company_profile', 'requirements'];
  
  // Optional fields that can be collapsed
  const optionalFields = ['location', 'department', 'salaryRange', 'benefits', 'employmentType', 'requiredExperience', 'education', 'role'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    const missingFields = requiredFields.filter(field => !job[field].trim());
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setError('');
    setResult(null);
    setIsLoading(true);

    const payload = {
      title: job.title.trim(),
      description: job.description.trim(),
      company_profile: job.company_profile.trim(),
      requirements: job.requirements.trim(),
      telecommuting: parseInt(job.telecommuting)
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
      setResult(data);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to the fraud detection service. Please check if the server is running.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setJob({
      title: '',
      location: '',
      department: '',
      salaryRange: '',
      company_profile: '',
      description: '',
      requirements: '',
      benefits: '',
      telecommuting: '0',
      employmentType: '',
      requiredExperience: '',
      education: '',
      role: ''
    });
    setResult(null);
    setError('');
  };

  const renderField = (field, isRequired = false, type = 'input') => {
    const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('_', ' ');
    
    return (
      <div key={field} className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">
          {label}
          {isRequired && <span className="text-red-600 ml-1">*</span>}
        </label>
        {type === 'textarea' ? (
          <textarea
            name={field}
            value={job[field]}
            onChange={handleChange}
            rows={field === 'description' ? 4 : 3}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
              isRequired && !job[field].trim() && error ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        ) : (
          <input
            type="text"
            name={field}
            value={job[field]}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
              isRequired && !job[field].trim() && error ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        )}
      </div>
    );
  };

  const getFraudRiskLevel = (probability) => {
    if (probability >= 0.7) return { level: 'High', color: 'text-red-600', bg: 'bg-red-50' };
    if (probability >= 0.4) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Fraud Detector</h1>
          <p className="text-gray-600">Enter job details to check for potential fraud indicators</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Required Information</h3>
              {renderField('title', true)}
              {renderField('company_profile', true, 'textarea')}
              {renderField('description', true, 'textarea')}
              {renderField('requirements', true, 'textarea')}
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Telecommuting <span className="text-red-600 ml-1">*</span>
                </label>
                <select
                  name="telecommuting"
                  value={job.telecommuting}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                >
                  <option value="0">No Remote Work</option>
                  <option value="1">Remote Work Available</option>
                </select>
              </div>
            </div>

            {/* Optional Fields Toggle */}
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {showOptionalFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showOptionalFields ? 'Hide' : 'Show'} Optional Fields
              </button>
            </div>

            {/* Optional Fields */}
            {showOptionalFields && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                {optionalFields.map(field => renderField(field))}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Check for Fraud
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Results Display */}
          {result && (
            <div className="mt-8 pt-6 border-t">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Analysis Complete</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Fraud Probability */}
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800 mb-1">Fraud Probability</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {((result.probability || result.fraud_probability) * 100).toFixed(1)}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(result.probability || result.fraud_probability) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className={`p-4 rounded-lg border-2 ${getFraudRiskLevel(result.probability || result.fraud_probability).bg}`}>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Risk Level</p>
                    <p className={`text-2xl font-bold ${getFraudRiskLevel(result.probability || result.fraud_probability).color}`}>
                      {getFraudRiskLevel(result.probability || result.fraud_probability).level} Risk
                    </p>
                    <p className={`text-sm ${getFraudRiskLevel(result.probability || result.fraud_probability).color} mt-1`}>
                      {result.is_fraud ? 'Potential fraud detected' : 'Appears legitimate'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
                  <ul className="text-sm text-blue-800 space-y-1 font-medium">
                    {(result.probability || result.fraud_probability) > 0.7 ? (
                      <>
                        <li>• Exercise extreme caution with this job posting</li>
                        <li>• Verify company details independently</li>
                        <li>• Never provide personal information or pay upfront fees</li>
                      </>
                    ) : (result.probability || result.fraud_probability) > 0.4 ? (
                      <>
                        <li>• Research the company thoroughly before applying</li>
                        <li>• Look for additional red flags in the posting</li>
                        <li>• Be cautious during the application process</li>
                      </>
                    ) : (
                      <>
                        <li>• This job posting appears legitimate</li>
                        <li>• Still verify company details as a best practice</li>
                        <li>• Proceed with normal application caution</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FraudCheckForm;