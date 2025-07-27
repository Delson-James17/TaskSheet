import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function Tasks() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Track and update your daily tasks here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
