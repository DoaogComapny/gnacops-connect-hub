import { Bell, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const UserNotifications = () => {
  const notifications = [
    { id: 1, type: "success", icon: CheckCircle, title: "Application Approved", message: "Your membership application has been approved. You can now make payment.", time: "2 hours ago", read: false },
    { id: 2, type: "info", icon: Mail, title: "Welcome to GNACOPS", message: "Welcome to Ghana National Association of Council of Private Schools.", time: "1 day ago", read: true },
    { id: 3, type: "warning", icon: AlertCircle, title: "Payment Reminder", message: "Please complete your membership fee payment to access all benefits.", time: "2 days ago", read: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your membership activities</p>
        </div>
        <Button variant="outline">Mark All as Read</Button>
      </div>

      {/* Notification Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-3xl font-bold text-primary">
                {notifications.filter(n => !n.read).length}
              </p>
            </div>
            <Bell className="h-10 w-10 text-primary/50" />
          </div>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-bold text-accent">
                {notifications.length}
              </p>
            </div>
            <Mail className="h-10 w-10 text-accent/50" />
          </div>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`p-6 hover-card ${!notification.read ? 'border-primary/50' : ''}`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                notification.type === 'success' ? 'bg-green-500/10' :
                notification.type === 'warning' ? 'bg-yellow-500/10' :
                'bg-blue-500/10'
              }`}>
                <notification.icon className={`h-6 w-6 ${
                  notification.type === 'success' ? 'text-green-500' :
                  notification.type === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.read && (
                      <Badge variant="default" className="mt-1">New</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{notification.time}</span>
                </div>
                <p className="text-muted-foreground">{notification.message}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserNotifications;
