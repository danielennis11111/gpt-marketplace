import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CommunityIdea {
  id: string;
  title: string;
  description: string;
  prompt?: string;
  category: string;
  aiSystemInstructions?: string;
}

interface CommunityIdeaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIdea: (idea: CommunityIdea) => void;
}

const CommunityIdeaSelector: React.FC<CommunityIdeaSelectorProps> = ({
  isOpen,
  onClose,
  onSelectIdea
}) => {
  const [communityIdeas, setCommunityIdeas] = useState<CommunityIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<CommunityIdea[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load community ideas from localStorage
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      try {
        const ideas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
        setCommunityIdeas(ideas);
        setFilteredIdeas(ideas);
      } catch (error) {
        console.error('Error loading community ideas:', error);
        setCommunityIdeas([]);
        setFilteredIdeas([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isOpen]);

  // Filter ideas based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredIdeas(communityIdeas);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = communityIdeas.filter(idea => 
      idea.title.toLowerCase().includes(lowerCaseQuery) ||
      idea.description.toLowerCase().includes(lowerCaseQuery) ||
      idea.category.toLowerCase().includes(lowerCaseQuery)
    );
    
    setFilteredIdeas(filtered);
  }, [searchQuery, communityIdeas]);

  // Handle idea selection
  const handleSelectIdea = (idea: CommunityIdea) => {
    onSelectIdea(idea);
    onClose();
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <div className="mt-3 sm:mt-0">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      Select Community Idea for Your Persona
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Choose a community idea to enhance your persona with specialized knowledge and capabilities.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search bar */}
                <div className="mt-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search ideas by title, description, or category"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Ideas list */}
                <div className="mt-4 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : filteredIdeas.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No community ideas found. Create one from the Launch Pad!</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {filteredIdeas.map((idea) => (
                        <li key={idea.id} className="py-4">
                          <div className="flex items-start">
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">{idea.title}</p>
                              <p className="text-sm text-gray-500 line-clamp-2">{idea.description}</p>
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                  {idea.category}
                                </span>
                              </div>
                            </div>
                            <button
                              className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              onClick={() => handleSelectIdea(idea)}
                            >
                              <CheckIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                              Select
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    onClick={() => {
                      window.open('/launch-pad', '_blank');
                    }}
                  >
                    Create New Idea
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CommunityIdeaSelector; 