import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function Settings() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the admin page for system configuration and preferences.</p>
        </CardContent>
      </Card>
    </div>
  )
}
