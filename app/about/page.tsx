import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="p-5 md:p-20 pt-20 md:pt-28 w-full">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-6xl font-extrabold tracking-tight">
            About <span className="text-orange-400">DailyTik</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Your Ultimate Productivity Partner
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Project Overview
            </CardTitle>
            <CardDescription>What makes DailyTik special</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                DailyTik is a modern task management application designed to
                help you stay organized and boost your productivity. Whether
                you&apos;re a student, professional, or just someone looking to
                manage their tasks efficiently, DailyTik is here to help you
                achieve your goals.
              </p>
              <p>
                Our mission is to provide a simple yet powerful tool that helps
                individuals and teams stay focused on what matters most, without
                unnecessary complexity.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Features</CardTitle>
              <CardDescription>What you can do with DailyTik</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6 list-disc pl-5">
                <li>
                  <span className="font-semibold">
                    Efficient Task Management:
                  </span>{" "}
                  Create, edit, and delete tasks with ease.
                </li>
                <li>
                  <span className="font-semibold">Detailed Notes:</span> Keep
                  track of your ideas, meeting minutes, or any other
                  information.
                </li>
                <li>
                  <span className="font-semibold">Smart Filtering:</span>{" "}
                  Quickly find what you&apos;re looking for with our powerful
                  search and filtering options.
                </li>
                <li>
                  <span className="font-semibold">Responsive Design:</span> Use
                  DailyTik on any device, whether it&apos;s your desktop,
                  tablet, or smartphone.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                Technology Stack
              </CardTitle>
              <CardDescription>Built with modern tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6 list-disc pl-5">
                <li>Next.js (App Router)</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>shadcn/ui components</li>
                <li>React Hook Form</li>
                <li>Zod validation</li>
                <li>NextAuth.js for authentication</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Development
            </CardTitle>
            <CardDescription>Open source and community-driven</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-10">
              <p>
                DailyTik is an open-source project. We welcome contributions
                from the community to make it even better. If you&apos;re
                interested in contributing, please check out our GitHub
                repository.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link
                    href="https://github.com/yourusername/dailytik"
                    target="_blank"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Back to App
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
