import React from 'react';
import { Helmet } from "react-helmet-async";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { User, Bell, CreditCard, Shield } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Settings = () => {
  const { user } = useAuth();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully."
    });
  };

  const handleNotificationToggle = () => {
    toast({
      title: "🚧 Push Notifications",
      description: "Push notification settings will be available with backend integration."
    });
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Settings - NovaVid</title>
        <meta name="description" content="Manage your account settings and preferences." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="account" className="text-white data-[state=active]:bg-blue-600">
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-blue-600">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="text-white data-[state=active]:bg-blue-600">
              Billing
            </TabsTrigger>
            <TabsTrigger value="security" className="text-white data-[state=active]:bg-blue-600">
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl">{user.name}</h3>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={user.name}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">Notification Preferences</h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Payment Status Updates', description: 'Get notified about payment confirmations and failures' },
                  { label: 'Project Updates', description: 'Notifications when your projects finish processing' },
                  { label: 'Marketing Emails', description: 'Receive updates about new features and offers' },
                  { label: 'Credit Alerts', description: 'Get notified when your credits are running low' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{item.label}</div>
                      <div className="text-gray-400 text-sm">{item.description}</div>
                    </div>
                    <Button
                      onClick={handleNotificationToggle}
                      variant="outline"
                      className="border-gray-700 text-white hover:bg-white/10"
                    >
                      Enable
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">Billing & Subscription</h3>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white font-semibold text-lg capitalize">{user.plan} Plan</div>
                    <div className="text-gray-400 text-sm">
                      {user.plan === 'free' ? 'Free Forever' : `$${user.plan === 'premium' ? '19' : '49'}/month`}
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    {user.plan === 'free' ? 'Upgrade' : 'Manage Plan'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
                  <div>
                    <div className="text-gray-400 text-sm">Credits Remaining</div>
                    <div className="text-white text-2xl font-bold">{user.credits}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Next Billing Date</div>
                    <div className="text-white text-lg">
                      {user.plan === 'free' ? 'N/A' : 'Dec 25, 2025'}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => toast({ title: "🚧 Payment integration coming soon!" })}
                variant="outline"
                className="w-full border-gray-700 text-white hover:bg-white/10"
              >
                Update Payment Method
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">Security Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-white">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  Update Password
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;