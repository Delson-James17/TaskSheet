import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function Timesheets() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>My Timesheets</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Submit or review your work logs for each day.</p>
        </CardContent>
      </Card>
    </div>
  )
}
