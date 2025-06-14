import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Wrench, FileText } from 'lucide-react';

const CustomReportPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
          <p className="text-gray-600 mt-1">
            Create and customize reports based on specific requirements
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} View
        </Badge>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Settings className="h-16 w-16 text-gray-300" />
              <Wrench className="h-8 w-8 text-gray-400 absolute -bottom-2 -right-2" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Custom Report Builder Coming Soon
          </h2>

          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're working on an advanced report builder that will allow you to create custom reports
            with drag-and-drop functionality, custom filters, and personalized visualizations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
            <div className="bg-blue-50 p-4 rounded-lg">
              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 mb-1">Drag & Drop Builder</h3>
              <p className="text-sm text-blue-700">
                Easily create reports by dragging and dropping data fields
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <Settings className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900 mb-1">Advanced Filters</h3>
              <p className="text-sm text-green-700">
                Apply complex filters and conditions to your data
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <Wrench className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900 mb-1">Custom Visualizations</h3>
              <p className="text-sm text-purple-700">
                Choose from various charts and visualization options
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              In the meantime, you can use our standard reports with filtering options.
            </p>

            <Button variant="outline" onClick={() => window.history.back()}>
              Back to Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Planned Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Report Builder Features:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Visual drag-and-drop interface
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Real-time data preview
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Custom field selection
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Advanced filtering options
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Multiple export formats
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Visualization Options:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Interactive charts and graphs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Customizable tables
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Dashboard widgets
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Scheduled report generation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Report sharing and collaboration
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomReportPage;
