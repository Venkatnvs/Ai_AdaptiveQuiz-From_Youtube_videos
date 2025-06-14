import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Play, Trophy, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MainLandingPage = () => {
  const {access, refresh} = useSelector(state => state.auth.authTokens);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login", { replace: true });
  };

  const handleSignUp = () => {
    navigate("/register", { replace: true });
  };

  useEffect(() => {
    if ((access && refresh) || (access && !refresh)) {
      navigate("/dashboard");
    }
  }, [access, refresh, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="logo" className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">AdaptiveLearn AI</h1>
            </div>
            <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            AI-Powered Adaptive Learning
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform YouTube videos into personalized quizzes using advanced AI. 
            Our Q-learning algorithm adapts to your learning style for optimal education.
          </p>
          <Button 
            onClick={handleSignUp}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
          >
            Get Started Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="bg-blue-100 p-3 rounded-lg w-fit mx-auto mb-4">
                <Play className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Video Processing</h3>
              <p className="text-gray-600">
                Automatically transcribe and analyze YouTube videos using OpenAI Whisper
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="bg-green-100 p-3 rounded-lg w-fit mx-auto mb-4">
                <Brain className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Question Generation</h3>
              <p className="text-gray-600">
                Generate intelligent questions tailored to video content using GPT-4o
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="bg-orange-100 p-3 rounded-lg w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Adaptive Learning</h3>
              <p className="text-gray-600">
                Q-learning algorithm adjusts difficulty based on your performance
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="bg-purple-100 p-3 rounded-lg w-fit mx-auto mb-4">
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reward System</h3>
              <p className="text-gray-600">
                Earn stars and achievements as you progress through your learning journey
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to revolutionize your learning?
              </h2>
              <p className="text-gray-600 mb-6">
                Join thousands of learners who are using AI to accelerate their education
              </p>
              <Button 
                onClick={handleSignUp}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Learning Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MainLandingPage;