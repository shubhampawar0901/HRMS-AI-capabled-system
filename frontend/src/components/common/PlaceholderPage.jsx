import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Construction className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {description || 'This module is currently under development and will be available soon.'}
            </p>
            <p className="text-sm text-gray-500">
              Please check back later for updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaceholderPage;
