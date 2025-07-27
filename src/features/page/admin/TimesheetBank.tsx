import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function TimesheetBank() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Timesheet Bank</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the admin page for viewing archived or permanent timesheet logs.</p>
        </CardContent>
      </Card>
    </div>
  )
}
