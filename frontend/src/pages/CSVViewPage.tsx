/**
 * CSV View Page - Separate page for viewing CSV table data
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CSVService } from '../services/api/csv.service'
import { CSVViewData } from '../types'
import {
  Container,
  Title,
  Button,
  Table,
  Paper,
  Text,
  Group,
  Loader,
  Center,
  Pagination,
  Select,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconArrowLeft, IconDownload } from '@tabler/icons-react'
import { CSV_VIEW } from '../config/constants'

export default function CSVViewPage() {
  const { fileId } = useParams<{ fileId: string }>()
  const navigate = useNavigate()
  const [csvData, setCsvData] = useState<CSVViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [maxRows, setMaxRows] = useState(CSV_VIEW.DEFAULT_MAX_ROWS)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  useEffect(() => {
    const loadCSVData = async () => {
      if (!fileId) {
        notifications.show({
          title: 'Error',
          message: 'File ID is required',
          color: 'red',
        })
        navigate(-1)
        return
      }

      setLoading(true)
      try {
        const data = await CSVService.view(parseInt(fileId), maxRows)
        setCsvData(data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load CSV file'
        notifications.show({
          title: 'Error',
          message,
          color: 'red',
        })
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }

    loadCSVData()
  }, [fileId, maxRows, navigate])

  const handleDownload = async () => {
    if (!fileId || !csvData) return
    try {
      await CSVService.download(parseInt(fileId), csvData.filename)
      notifications.show({
        title: 'Success',
        message: 'File download started',
        color: 'green',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download file'
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      })
    }
  }


  // Calculate pagination
  const totalPages = csvData
    ? Math.ceil(Math.min(csvData.displayed_rows, csvData.total_rows) / rowsPerPage)
    : 0
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedRows = csvData?.rows.slice(startIndex, endIndex) || []

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    )
  }

  if (!csvData) {
    return (
      <Container size="xl" py="xl">
        <Text>No data available</Text>
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <Button
            color='gray'
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Group>
        <Group>
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </Group>
      </Group>

      <Paper p="md" mb="md" withBorder>
        <Group justify="space-between" align="items-center" mb="md">
          <Group gap="md">
            <div className="grid gap-2">
              <Title >{csvData.filename}</Title>
              <div className="flex gap-4">
                <Text size="sm" c="dimmed" fw={500}>
                  Total rows: {csvData.total_rows}
                </Text>
                <Text size="sm" c="dimmed" fw={500}>
                  Displayed: {csvData.displayed_rows}
                </Text>
              </div>
            </div>
          </Group>
          <Group gap="md" align="flex-end">
            <Select
              label="Max Rows"
              value={maxRows.toString()}
              onChange={(value) => {
                setMaxRows(parseInt(value || CSV_VIEW.DEFAULT_MAX_ROWS.toString()))
                setCurrentPage(1)
              }}
              data={[
                { value: '100', label: '100' },
                { value: '500', label: '500' },
                { value: '1000', label: '1000' },
              ]}
              w={120}
            />
            <Select
              label="Rows per page"
              value={rowsPerPage.toString()}
              onChange={(value) => {
                setRowsPerPage(parseInt(value || '50'))
                setCurrentPage(1)
              }}
              data={[
                { value: '25', label: '25' },
                { value: '50', label: '50' },
                { value: '100', label: '100' },
              ]}
              w={120}
            />
          </Group>
        </Group>
      </Paper>

      <Paper withBorder style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {csvData.headers.map((header) => (
                <Table.Th key={header}>{header}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedRows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={csvData.headers.length} ta="center">
                  <Text c="dimmed">No data to display</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <Table.Tr key={startIndex + idx}>
                  {csvData.headers.map((header) => (
                    <Table.Td key={header}>{row[header] || ''}</Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {totalPages > 1 && (
        <Paper p="md" mt="md" withBorder>
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Page {currentPage} of {totalPages} ({Math.min(csvData.displayed_rows, csvData.total_rows)} displayed rows)
            </Text>
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="sm"
            />
          </Group>
        </Paper>
      )}
    </Container>
  )
}

