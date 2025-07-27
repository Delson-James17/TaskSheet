import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function Roles() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the admin page for creating and managing system roles.</p>
        </CardContent>
      </Card>
    </div>
  )
}
