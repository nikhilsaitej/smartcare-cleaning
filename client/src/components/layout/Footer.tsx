import { COMPANY_INFO } from "@/lib/constants";
import { Facebook, Instagram, Linkedin, MapPin, Mail, Phone, Shield, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Company",
      links: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" }
      ]
    },
    {
      title: "Services",
      links: [
        { label: "Home Cleaning", href: "/services" },
        { label: "Office Cleaning", href: "/services" },
        { label: "Products", href: "/products" },
        { label: "Maintenance", href: "/services" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Contact Us", href: "/contact" },
        { label: "FAQ", href: "#" },
        { label: "Support Center", href: "#" },
        { label: "Feedback", href: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-600"></div>

      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold">SC</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display leading-none">SMARTCARE</h2>
                  <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">Cleaning</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-6 max-w-xs leading-relaxed">
                Professional cleaning services trusted by 5000+ families and businesses in Vijayawada.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-blue-200">
                <Award className="w-4 h-4 text-orange-400" />
                <span>ISO Certified Service</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-200">
                <Shield className="w-4 h-4 text-orange-400" />
                <span>100% Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-200">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>24/7 Available</span>
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h3 className="text-lg font-bold mb-4 text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a 
                      href={link.href} 
                      className="text-gray-300 hover:text-orange-400 transition-colors text-sm font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4 text-white">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Location</p>
                  <p className="text-sm text-gray-200">{COMPANY_INFO.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Phone</p>
                  <a href={`tel:${COMPANY_INFO.phone}`} className="text-sm text-gray-200 hover:text-orange-400 transition-colors font-medium">
                    {COMPANY_INFO.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Email</p>
                  <a href={`mailto:${COMPANY_INFO.email}`} className="text-sm text-gray-200 hover:text-orange-400 transition-colors font-medium break-all">
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300 hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300 hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8"></div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-xs text-gray-400">
            <p>&copy; {currentYear} SmartCare Cleaning Solutions. All rights reserved.</p>
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Cookie Policy</a>
          </div>
          
          <div className="text-xs text-gray-500">
            Designed with 💙 by SmartCare Team
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
