import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeParserForm from '@/components/ai-features/ResumeParserForm';

const ResumeParserPage = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/ai-features');
  };

  return (
    <div className="p-6">
      <ResumeParserForm
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ResumeParserPage;
