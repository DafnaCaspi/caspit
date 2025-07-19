import { Button } from "@/components/ui/button";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold">SchemaBoost</span>
            </div>
            <p className="text-secondary-foreground/80 max-w-sm">
              The most powerful schema markup validation and optimization platform for SEO professionals.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-secondary-foreground">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-secondary-foreground">
                <Github className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-secondary-foreground">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-secondary-foreground">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <div className="space-y-3">
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Features</a>
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Pricing</a>
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">API</a>
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Integrations</a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <div className="space-y-3">
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Documentation</a>
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Blog</a>
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Case Studies</a>
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Support</a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <div className="space-y-3">
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">About</a>
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Careers</a>
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Privacy</a>
              <a href="#" className="block text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-foreground/60 text-sm">
            © 2024 SchemaBoost. All rights reserved.
          </p>
          <p className="text-secondary-foreground/60 text-sm">
            Built with ❤️ for SEO professionals
          </p>
        </div>
      </div>
    </footer>
  );
};