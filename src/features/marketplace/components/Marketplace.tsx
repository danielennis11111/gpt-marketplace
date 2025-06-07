import React, { useEffect, useState } from 'react';
import { fetchGptProjects } from '../../../shared/api/mockApi';
import { GptProject } from '../../../shared/types';
import { ProjectCard } from '../../../shared/components';

const Marketplace: React.FC = () => {
  const [gpts, setGpts] = useState<GptProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchGptProjects().then((data) => {
      setGpts(data);
      setLoading(false);
    });
  }, []);

  const filteredGpts = gpts.filter((gpt) => {
    const matchesSearch =
      gpt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gpt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gpt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter ? gpt.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (term: string) => setSearchTerm(term);
  const handleCategoryChange = (category: string) => setCategoryFilter(category);

  const handleClone = (project: GptProject) => {
    alert(`GPT '${project.name}' cloned! (Mock action)`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GPT Marketplace</h1>
      
      {loading ? (
        <div className="text-center py-8">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGpts.map((gpt) => (
            <ProjectCard key={gpt.id} project={gpt} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace; 