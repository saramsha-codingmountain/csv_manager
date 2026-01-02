/**
 * User Panel - CSV File Viewer
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CSVService } from '../services/api/csv.service'
import { CSVFile, WebSocketMessage } from '../types'
import { useWebSocket } from '../hooks/useWebSocket'
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
import { IconLogout, IconDownload } from '@tabler/icons-react'
import { CSV_VIEW } from '../config/constants'

export default function UserPanel() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // WebSocket connection for real-time updates
  useWebSocket(token, (data: WebSocketMessage) => {
    if (data.event === 'csv_list_updated') {
      if (data.action === 'uploaded' && data.file) {
        setCsvFiles((prev: CSVFile[]) => [data.file as CSVFile, ...prev])
        notifications.show({
          title: 'New CSV available',
          message: `${data.file.filename} was uploaded`,
          color: 'blue',
        })
      } else if (data.action === 'deleted') {
        setCsvFiles((prev: CSVFile[]) => prev.filter((f: CSVFile) => f.id !== data.file_id))
        notifications.show({
          title: 'CSV removed',
          message: 'A CSV file was removed',
          color: 'orange',
        })
      }
      // Refresh the list
      loadCSVFiles()
    }
  })

  const loadCSVFiles = useCallback(async () => {
    try {
      const files = await CSVService.list()
      setCsvFiles(files)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load CSV files'
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      })
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await loadCSVFiles()
      setLoading(false)
    }
    loadData()
  }, [loadCSVFiles])

  const handleViewFile = (fileId: number) => {
    navigate(`/csv/${fileId}/view`)
  }

  const handleDownloadFile = async (fileId: number, filename: string) => {
    try {
      await CSVService.download(fileId, filename)
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Pagination calculations
  const totalPages = Math.ceil(csvFiles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFiles = csvFiles.slice(startIndex, endIndex)

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title>CSV Files</Title>
        <Group>
          <Text>Welcome, {user?.username}</Text>
          <Button leftSection={<IconLogout size={16} />} variant="light" onClick={logout}>
            Logout
          </Button>
        </Group>
      </Group>

      <Paper p="md" mb="md" withBorder>
        <Group justify="space-between" align="flex-end">
          <Text size="sm" c="dimmed" fw={500}>
            Total: {csvFiles.length} files
          </Text>
          <Select
            label="Items per page"
            value={itemsPerPage.toString()}
            onChange={(value) => {
              setItemsPerPage(parseInt(value || '10'))
              setCurrentPage(1)
            }}
            data={[
              { value: '5', label: '5' },
              { value: '10', label: '10' },
              { value: '25', label: '25' },
              { value: '50', label: '50' },
            ]}
            w={150}
          />
        </Group>
      </Paper>

      <Paper withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Filename</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Uploader</Table.Th>
              <Table.Th>Upload Date</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedFiles.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} ta="center">
                  <Text c="dimmed">No CSV files available</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              paginatedFiles.map((file: CSVFile) => (
                <Table.Tr key={file.id}>
                  <Table.Td>{file.filename}</Table.Td>
                  <Table.Td>{formatFileSize(file.file_size)}</Table.Td>
                  <Table.Td>{file.uploader_username}</Table.Td>
                  <Table.Td>{new Date(file.uploaded_at).toLocaleString()}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button variant="light" size="xs" onClick={() => handleViewFile(file.id)}>
                        View
                      </Button>
                      <Button
                        variant="light"
                        size="xs"
                        leftSection={<IconDownload size={14} />}
                        onClick={() => handleDownloadFile(file.id, file.filename)}
                      >
                        Download
                      </Button>
                    </Group>
                  </Table.Td>
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
              Page {currentPage} of {totalPages} ({csvFiles.length} total files)
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
