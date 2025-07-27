import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function UserRoles() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the admin page for managing roles assigned to users.</p>
        </CardContent>
      </Card>
    </div>
  )
}
