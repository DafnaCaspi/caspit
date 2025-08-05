import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, Code, Zap, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SchemaResult {
  type: string;
  valid: boolean;
  issues: Array<{
    level: 'error' | 'warning' | 'info';
    message: string;
  }>;
  recommendations: string[];
  suggestedSchema?: string;
}

interface SchemaSuggestion {
  name: string;
  description: string;
  code: string;
}

export const SchemaAnalyzer = () => {
  const [code, setCode] = useState("");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [results, setResults] = useState<SchemaResult[]>([]);
  const [suggestions, setSuggestions] = useState<SchemaSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeSchema = async () => {
    const inputEmpty = activeTab === "code" ? !code.trim() : !url.trim();
    
    if (inputEmpty) {
      toast({
        title: activeTab === "code" ? "No code provided" : "No URL provided",
        description: activeTab === "code" ? "Please enter some HTML code to analyze" : "Please enter a website URL to analyze",
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
        ],
        suggestedSchema: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Business Name",
  "url": "https://yourbusiness.com",
  "telephone": "+1-555-123-4567",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Business St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://facebook.com/yourbusiness",
    "https://twitter.com/yourbusiness"
  ]
}`
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
        ],
        suggestedSchema: `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "description": "Product description",
  "offers": {
    "@type": "Offer",
    "price": "19.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}`
      }
    ];

    // Mock schema suggestions
    const mockSuggestions: SchemaSuggestion[] = [
      {
        name: "Article",
        description: "For blog posts, news articles, and editorial content",
        code: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-01",
  "image": "https://example.com/image.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "Publisher Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.jpg"
    }
  }
}`
      },
      {
        name: "LocalBusiness",
        description: "For local businesses with physical locations",
        code: `{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345"
  },
  "telephone": "+1-555-123-4567",
  "openingHours": "Mo-Fr 09:00-17:00",
  "priceRange": "$$"
}`
      },
      {
        name: "FAQPage",
        description: "For FAQ pages and question-answer content",
        code: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is schema markup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Schema markup is structured data that helps search engines understand your content better."
      }
    }
  ]
}`
      },
      {
        name: "Review",
        description: "For product reviews and ratings",
        code: `{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": "Product Name"
  },
  "author": {
    "@type": "Person",
    "name": "Reviewer Name"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "reviewBody": "Great product, highly recommended!"
}`
      }
    ];
    
    setResults(mockResults);
    setSuggestions(mockSuggestions);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis complete",
      description: `Found ${mockResults.length} schema types and ${mockSuggestions.length} suggestions`,
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
              Analyze schema markup by pasting HTML code or entering a website URL to get instant validation results with actionable optimization recommendations.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Schema Analysis Input
                </CardTitle>
                <CardDescription>
                  Choose how you want to analyze schema markup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="code" className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      HTML Code
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website URL
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="code" className="space-y-4">
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
                  </TabsContent>
                  
                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="website-url" className="text-sm font-medium">
                        Website URL
                      </label>
                      <Input
                        id="website-url"
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="min-h-[50px]"
                      />
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg min-h-[240px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Enter a website URL above to analyze its schema markup</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
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
                         
                         {result.suggestedSchema && (
                           <div className="mt-4">
                             <h4 className="text-sm font-medium mb-2">Optimized Schema Code:</h4>
                             <div className="bg-muted rounded-lg p-3">
                               <pre className="text-xs overflow-x-auto">
                                 <code>{result.suggestedSchema}</code>
                               </pre>
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

          {/* Schema Suggestions Section */}
          {suggestions.length > 0 && (
            <div className="mt-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Recommended Schema Types
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Common schema types that can boost your SEO rankings. Copy and customize these templates for your content.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                      <CardDescription>{suggestion.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted rounded-lg p-4">
                        <pre className="text-xs overflow-x-auto">
                          <code>{suggestion.code}</code>
                        </pre>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 w-full"
                        onClick={() => {
                          navigator.clipboard.writeText(`<script type="application/ld+json">\n${suggestion.code}\n</script>`);
                          toast({
                            title: "Copied to clipboard",
                            description: `${suggestion.name} schema template copied with script tags`,
                          });
                        }}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};