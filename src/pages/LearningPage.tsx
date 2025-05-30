import React, { useState } from 'react';

const LearningPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Overview of MyAI Builder</h2>
            <p className="mb-4">
              MyAI Builder is Arizona State University's platform for creating, customizing, and sharing AI projects. 
              It enables faculty, staff, and students to leverage artificial intelligence for education, research, and productivity 
              without requiring extensive technical knowledge.
            </p>
            <p className="mb-4">
              The BetaLand Templates are a curated marketplace of pre-built AI templates that can be cloned and customized to fit specific needs.
              These templates are designed to address common use cases across the university, from course design to research assistance.
            </p>
            <div className="bg-amber-100 p-4 rounded-lg mb-4">
              <h3 className="font-bold">Key Features:</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Browse verified templates created by ASU departments and individuals</li>
                <li>Clone templates to create your own customized versions</li>
                <li>Share your projects with colleagues or publish them to the marketplace</li>
                <li>Detailed documentation and examples for each template</li>
              </ul>
            </div>
          </div>
        );
      case 'browsing':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Finding the Right Template</h2>
            <p className="mb-4">
              The BetaLand Templates offer multiple ways to discover templates that match your needs.
              Understanding the filtering and search options will help you quickly find relevant projects.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Search and Filters</h3>
            <p className="mb-4">
              Use the search bar to look for specific keywords related to your needs. The filters button expands additional options:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Category:</strong> Filter by broad domains like Education, Development, Analytics, etc.</li>
              <li><strong>Capability:</strong> Find templates with specific AI capabilities like Content Creation, Analysis, or Integration</li>
              <li><strong>Action:</strong> Filter by what the template can do, such as Generate, Analyze, or Configure</li>
              <li><strong>Verification:</strong> Show only verified templates (those reviewed by ASU for quality and security)</li>
              <li><strong>Sort By:</strong> Arrange results by popularity, rating, or recency</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Understanding Template Cards</h3>
            <p className="mb-4">
              Each template card provides essential information at a glance:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Verification Badge:</strong> Shows if the template has been reviewed and approved</li>
              <li><strong>Creator:</strong> The department or individual who created the template</li>
              <li><strong>Rating:</strong> Average rating from users who have used the template</li>
              <li><strong>Description:</strong> Brief overview of what the template does</li>
              <li><strong>Tags:</strong> Keywords related to the template's functionality</li>
            </ul>
          </div>
        );
      case 'using':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Using Templates</h2>
            <p className="mb-4">
              Once you've found a template that matches your needs, you can view its details and clone it to create your own version.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Viewing Template Details</h3>
            <p className="mb-4">
              Click the "View Details" button on any template card to see:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Comprehensive description and use cases</li>
              <li>Example conversations demonstrating how the AI responds</li>
              <li>Configuration options available for customization</li>
              <li>Reviews from other users</li>
              <li>Version history and update notes</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Cloning a Template</h3>
            <p className="mb-4">
              When you clone a template, you create your own copy that you can customize. The cloning process:
            </p>
            <ol className="list-decimal pl-5 mb-4">
              <li>Creates a new project in your MyAI Projects section</li>
              <li>Copies all the template instructions and configurations</li>
              <li>Allows you to modify parameters while maintaining core functionality</li>
              <li>Preserves attribution to the original creator</li>
            </ol>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Customizing Your Clone</h3>
            <p className="mb-4">
              After cloning, you can customize various aspects of the template:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Instructions:</strong> Modify the core prompts that define the AI's behavior</li>
              <li><strong>Knowledge Base:</strong> Add your own documents or references</li>
              <li><strong>Parameters:</strong> Adjust settings like temperature (creativity) and token limits</li>
              <li><strong>Capabilities:</strong> Enable or disable features like web browsing or code interpretation</li>
            </ul>
          </div>
        );
      case 'verification':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Verification System</h2>
            <p className="mb-4">
              ASU's verification system ensures templates meet quality, security, and ethical standards before being broadly shared.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Verification Process</h3>
            <p className="mb-4">
              When a template is submitted for verification, it undergoes a multi-step review:
            </p>
            <ol className="list-decimal pl-5 mb-4">
              <li><strong>Technical Review:</strong> Checking for proper functionality and performance</li>
              <li><strong>Security Assessment:</strong> Ensuring the template doesn't pose security risks</li>
              <li><strong>Content Review:</strong> Verifying that outputs meet ASU's standards</li>
              <li><strong>User Experience Testing:</strong> Evaluating usability and clarity</li>
            </ol>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Verification Badges</h3>
            <p className="mb-4">
              Templates display their verification status prominently:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Verified:</strong> Has passed all reviews and is recommended for use</li>
              <li><strong>Unverified:</strong> May still be useful but hasn't undergone formal review</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Submitting for Verification</h3>
            <p className="mb-4">
              To submit your template for verification:
            </p>
            <ol className="list-decimal pl-5 mb-4">
              <li>Ensure your template is complete and thoroughly tested</li>
              <li>Navigate to the project settings in MyAI Projects</li>
              <li>Select "Publish to Marketplace" and enable the verification request</li>
              <li>Complete the template metadata including descriptions, tags, and use cases</li>
              <li>Submit for review (typical review time: 5-7 business days)</li>
            </ol>
          </div>
        );
      case 'capabilities':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Understanding Template Capabilities</h2>
            <p className="mb-4">
              Templates have different capabilities and actions that determine what they can do. Understanding these will help you select the right template for your needs.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Core Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold">Content Creation</h4>
                <p>Generating original text, images, or ideas based on prompts</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold">Analysis</h4>
                <p>Examining data, text, or other content to extract insights</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold">Learning</h4>
                <p>Adapting responses based on feedback or patterns</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold">Integration</h4>
                <p>Connecting with other systems or data sources</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold">Planning</h4>
                <p>Organizing tasks, creating schedules, or developing strategies</p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Specialized Capabilities</h3>
            <p className="mb-4">
              Some templates offer more specialized capabilities:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Code Conversion:</strong> Translating code between programming languages</li>
              <li><strong>Music Generation:</strong> Creating musical patterns or compositions</li>
              <li><strong>Historical Simulation:</strong> Recreating personalities or events from history</li>
              <li><strong>Process Analysis:</strong> Evaluating and improving workflows</li>
              <li><strong>Literary Criticism:</strong> Analyzing writing styles and themes</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Common Actions</h3>
            <p className="mb-4">
              Actions represent specific operations a template can perform:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Generate:</strong> Create new content based on inputs</li>
              <li><strong>Analyze:</strong> Examine data and provide insights</li>
              <li><strong>Create:</strong> Develop structured content like reports or code</li>
              <li><strong>Configure:</strong> Set up or adjust parameters for systems</li>
              <li><strong>Track:</strong> Monitor progress or changes over time</li>
            </ul>
          </div>
        );
      case 'categories':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Template Categories</h2>
            <p className="mb-4">
              Templates are organized into categories based on their primary purpose and domain. Here's an overview of the main categories:
            </p>
            
            <div className="space-y-6 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Productivity</h3>
                <p className="mb-2">Templates designed to enhance workflow efficiency and personal productivity.</p>
                <p><strong>Examples:</strong> Plan with AI, Checklist Manifesto Guide</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Development</h3>
                <p className="mb-2">Tools for software development, coding assistance, and technical problem-solving.</p>
                <p><strong>Examples:</strong> C-3PO Coding Helper, Programming Language Converter, Custom APIs for Non Coders</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Education</h3>
                <p className="mb-2">Templates focused on teaching, learning, and educational content creation.</p>
                <p><strong>Examples:</strong> Adventure: ASU Edition, Superhuman Poet, MSBA Guide</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                <p className="mb-2">Tools for data analysis, visualization, and business intelligence.</p>
                <p><strong>Examples:</strong> Data Chatbot - ASU Analytics</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Research</h3>
                <p className="mb-2">Templates to assist with academic research, literature reviews, and experimentation.</p>
                <p><strong>Examples:</strong> Myers Briggs Simulator</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Specialty Categories</h3>
                <p className="mb-2">Other focused domains with specific applications:</p>
                <ul className="list-disc pl-5">
                  <li><strong>Project Management:</strong> Tools for planning, tracking, and executing projects</li>
                  <li><strong>Music:</strong> Templates for composition, analysis, and music theory</li>
                  <li><strong>Literature:</strong> Focused on writing, analysis, and literary creation</li>
                  <li><strong>History:</strong> Historical simulations and educational resources</li>
                  <li><strong>Wellness:</strong> Templates supporting mental health and wellbeing</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'bestpractices':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
            <p className="mb-4">
              Follow these guidelines to get the most out of the MyAI Builder platform and templates:
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Selecting Templates</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Start with verified templates when available for assured quality</li>
              <li>Read reviews and check ratings to learn from others' experiences</li>
              <li>Test templates with sample inputs before fully committing to a project</li>
              <li>Consider the template's update history - actively maintained templates are often more reliable</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Customizing Templates</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Make incremental changes and test after each modification</li>
              <li>Document your customizations for future reference</li>
              <li>Consider the original template's purpose when modifying - some changes may affect core functionality</li>
              <li>Use the example conversations as a guide for expected behavior</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Creating Your Own Templates</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Start by cloning similar templates rather than building from scratch</li>
              <li>Thoroughly test with diverse inputs to ensure robust performance</li>
              <li>Create comprehensive documentation for users</li>
              <li>Include example conversations that demonstrate key capabilities</li>
              <li>Use clear, specific tags to make your template discoverable</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Ethical Considerations</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Respect intellectual property - credit original sources appropriately</li>
              <li>Consider privacy implications when using AI with sensitive data</li>
              <li>Test for bias in your template's responses and make corrections</li>
              <li>Be transparent about the template's limitations in your documentation</li>
              <li>Follow ASU's AI ethics guidelines available in the Resources section</li>
            </ul>
            
            <div className="bg-amber-100 p-4 rounded-lg mt-6">
              <h3 className="font-bold">Pro Tip:</h3>
              <p>
                When customizing templates for courses, involve students in testing to ensure the AI responses 
                meet their learning needs and provide appropriate levels of assistance without solving problems for them.
              </p>
            </div>
          </div>
        );
      case 'resources':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
            <p className="mb-4">
              Explore these resources to deepen your understanding of AI at ASU and improve your use of the MyAI Builder platform.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">ASU AI Resources</h3>
            <ul className="list-disc pl-5 mb-4">
              <li><a href="#" className="text-blue-600 hover:underline">ASU AI Initiative Homepage</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">CreateAI Documentation Hub</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">AI Ethics Guidelines for ASU Community</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">ASU AI Webinar Series (Recordings)</a></li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Training & Workshops</h3>
            <ul className="list-disc pl-5 mb-4">
              <li><a href="#" className="text-blue-600 hover:underline">Introduction to MyAI Builder (Monthly Webinar)</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">Advanced Template Customization Workshop</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">AI in Education: Best Practices</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">Request Custom Department Training</a></li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Support Channels</h3>
            <ul className="list-disc pl-5 mb-4">
              <li><a href="#" className="text-blue-600 hover:underline">Technical Support Portal</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">Feature Request Form</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">ASU AI Community Slack Channel</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">Office Hours Calendar</a></li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Video Tutorials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-4 rounded-lg">
                <h4 className="font-bold">Getting Started with MyAI Builder</h4>
                <p className="text-sm text-gray-600">10:24 • Basic orientation</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-bold">Customizing Templates for Teaching</h4>
                <p className="text-sm text-gray-600">15:36 • For faculty</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-bold">Advanced Configuration Options</h4>
                <p className="text-sm text-gray-600">22:18 • Technical details</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-bold">Template Publishing Workflow</h4>
                <p className="text-sm text-gray-600">08:45 • Share your creations</p>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Learning Center</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-8">
              <h2 className="font-bold text-lg mb-4">Documentation</h2>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeSection === 'overview' ? 'bg-maroon-700 text-black' : 'hover:bg-gray-100'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveSection('browsing')}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeSection === 'browsing' ? 'bg-maroon-700 text-black' : 'hover:bg-gray-100'
                  }`}
                >
                  Finding Templates
                </button>
                <button
                  onClick={() => setActiveSection('using')}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeSection === 'using' ? 'bg-maroon-700 text-black' : 'hover:bg-gray-100'
                  }`}
                >
                  Using Templates
                </button>
                <button
                  onClick={() => setActiveSection('verification')}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeSection === 'verification' ? 'bg-maroon-700 text-black' : 'hover:bg-gray-100'
                  }`}
                >
                  Verification System
                </button>
                <button
                  onClick={() => setActiveSection('capabilities')}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeSection === 'capabilities' ? 'bg-maroon-700 text-black' : 'hover:bg-gray-100'
                  }`}
                >
                  Template Capabilities
                </button>
                <button
                  onClick={() => setActiveSection('categories')}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeSection === 'categories' ? 'bg-maroon-700 text-black' : 'hover:bg-gray-100'
                  }`}
                >
                  Template Categories
                </button>
                <button
                  onClick={() => setActiveSection('bestpractices')}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeSection === 'bestpractices' ? 'bg-maroon-700 text-black' : 'hover:bg-gray-100'
                  }`}
                >
                  Best Practices
                </button>
                <button
                  onClick={() => setActiveSection('resources')}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeSection === 'resources' ? 'bg-maroon-700 text-black' : 'hover:bg-gray-100'
                  }`}
                >
                  Additional Resources
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage; 