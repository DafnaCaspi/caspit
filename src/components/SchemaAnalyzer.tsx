import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Code, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SchemaResult {
  type: string;
  valid: boolean;
  issues: Array<{
    level: 'error' | 'warning' | 'info';
    message: string;
  }>;
  recommendations: string[];
}

export const SchemaAnalyzer = () => {
  const [code, setCode] = useState("");
  const [results, setResults] = useState<SchemaResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeSchema = async () => {
    if (!code.trim()) {
      toast({
        title: "No code provided",
        description: "Please enter some HTML code to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call - in real implementation, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock results for demonstration
    const mockResults: SchemaResult[] = [
      {
        type: "Organization",
        valid: true,
        issues: [
          { level: 'warning', message: 'Missing "telephone" property for better local SEO' },
          { level: 'info', message: 'Consider adding "sameAs" for social media profiles' }
        ],
        recommendations: [
          'Add telephone number for local business optimization',
          'Include social media profile URLs in "sameAs" array'
        ]
      },
      {
        type: "Product",
        valid: false,
        issues: [
          { level: 'error', message: 'Required property "name" is missing' },
          { level: 'error', message: 'Invalid price format - should be numeric' },
          { level: 'warning', message: 'Missing "brand" property' }
        ],
        recommendations: [
          'Add required "name" property to Product schema',
          'Format price as numeric value (e.g., "19.99")',
          'Include brand information for better product visibility'
        ]
      }
    ];
    
    setResults(mockResults);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis complete",
      description: `Found ${mockResults.length} schema types in your code`,
    });
  };

  const getIssueIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-primary" />;
    }
  };

  const getIssueColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <section id="analyzer" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Live Schema Analyzer
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste your HTML code below and get instant validation results with actionable optimization recommendations.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  HTML Code Input
                </CardTitle>
                <CardDescription>
                  Paste your HTML code containing schema markup here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://example.com"
}
</script>`}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <Button 
                  onClick={analyzeSchema} 
                  disabled={isAnalyzing}
                  variant="hero"
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze Schema
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  Validation results and optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter HTML code and click "Analyze Schema" to see results</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {results.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-foreground">{result.type} Schema</h3>
                          <Badge variant={result.valid ? "default" : "destructive"}>
                            {result.valid ? "Valid" : "Invalid"}
                          </Badge>
                        </div>
                        
                        {result.issues.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Issues Found:</h4>
                            <div className="space-y-2">
                              {result.issues.map((issue, issueIndex) => (
                                <div key={issueIndex} className="flex items-start gap-2 text-sm">
                                  {getIssueIcon(issue.level)}
                                  <span className="flex-1">{issue.message}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {result.recommendations.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                            <div className="space-y-1">
                              {result.recommendations.map((rec, recIndex) => (
                                <div key={recIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  <span className="flex-1">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};