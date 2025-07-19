import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  CheckCircle, 
  Zap, 
  Shield, 
  BarChart3, 
  Code2, 
  Rocket, 
  Users, 
  Globe
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Schema Detection",
    description: "Automatically detect all schema markup types in your HTML code",
    badge: "AI-Powered"
  },
  {
    icon: CheckCircle,
    title: "Validation Engine",
    description: "Comprehensive validation against Schema.org standards",
    badge: "Real-time"
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get results in seconds with our optimized parsing engine",
    badge: "Lightning Fast"
  },
  {
    icon: Shield,
    title: "Error Detection",
    description: "Identify syntax errors, missing properties, and invalid formats",
    badge: "Advanced"
  },
  {
    icon: BarChart3,
    title: "SEO Scoring",
    description: "Get SEO impact scores and ranking improvement suggestions",
    badge: "Pro Feature"
  },
  {
    icon: Code2,
    title: "Code Generation",
    description: "Generate optimized schema markup from templates",
    badge: "Templates"
  },
  {
    icon: Rocket,
    title: "Performance Optimization",
    description: "Optimize markup for faster loading and better performance",
    badge: "Speed"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share reports and collaborate with your development team",
    badge: "Team"
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    description: "Support for international schema markup variations",
    badge: "Global"
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Schema Optimization
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to master schema markup and boost your search engine rankings
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary-glow/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-full border border-primary/20">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">
                All features included in Pro plan
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};