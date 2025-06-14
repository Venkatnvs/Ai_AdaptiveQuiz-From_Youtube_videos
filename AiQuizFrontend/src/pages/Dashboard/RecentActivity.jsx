import { Card, CardContent } from "@/components/ui/card";
import { Play, CheckCircle, Video } from "lucide-react";

export default function RecentActivity({ activities, isLoading }) {

    if (isLoading) {
        return (
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-1">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-12"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getActivityIcon = (type) => {
        switch (type) {
            case "quiz_completed": return CheckCircle;
            case "video_processed": return Video;
            default: return Play;
        }
    };

    const getActivityBgColor = (type) => {
        switch (type) {
            case "quiz_completed": return "bg-edu-green-light";
            case "video_processed": return "bg-edu-orange-light";
            default: return "bg-edu-blue-light";
        }
    };

    const getActivityIconColor = (type) => {
        switch (type) {
            case "quiz_completed": return "text-green-600";
            case "video_processed": return "text-orange-600";
            default: return "text-blue-600";
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const activityDate = new Date(date);
        const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "< 1h ago";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    return (
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>

                <div className="space-y-4">
                    {activities && activities.length > 0 ? (
                        activities.slice(0, 3).map((activity, index) => {
                            const Icon = getActivityIcon(activity.type);
                            return (
                                <div key={activity.id || index} className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityBgColor(activity.type)}`}>
                                        <Icon className={`h-4 w-4 ${getActivityIconColor(activity.type)}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.description}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {formatTimeAgo(activity.createdAt || activity.date)}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        // Default activities when none exist
                        <>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-edu-blue-light rounded-full flex items-center justify-center flex-shrink-0">
                                    <Play className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">Machine Learning Basics</p>
                                    <p className="text-xs text-gray-500">Completed quiz • 95% score</p>
                                </div>
                                <span className="text-xs text-gray-400">2h ago</span>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-edu-green-light rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">Python Data Structures</p>
                                    <p className="text-xs text-gray-500">Completed quiz • 87% score</p>
                                </div>
                                <span className="text-xs text-gray-400">1d ago</span>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-edu-orange-light rounded-full flex items-center justify-center flex-shrink-0">
                                    <Video className="h-4 w-4 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">Neural Networks Introduction</p>
                                    <p className="text-xs text-gray-500">Video processed • Quiz ready</p>
                                </div>
                                <span className="text-xs text-gray-400">2d ago</span>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
