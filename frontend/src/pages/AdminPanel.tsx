/**
 * Admin Panel - CSV and User Management
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CSVService } from '../services/api/csv.service'
import { UsersService } from '../services/api/users.service'
import { CSVFile, User, WebSocketMessage } from '../types'
import { useWebSocket } from '../hooks/useWebSocket'
import {
  Container,
  Title,
  Button,
  Table,
  Paper,
  Tabs,
  FileButton,
  Text,
  ActionIcon,
  Modal,
  Group,
  Loader,
  Center,
  TextInput,
  Select,
  Pagination,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconTrash, IconUpload, IconLogout, IconDownload, IconEye, IconEdit } from '@tabler/icons-react'

export default function AdminPanel() {
  const { user, token, logout, signup } = useAuth()
  const navigate = useNavigate()
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Pagination states
  const [csvCurrentPage, setCsvCurrentPage] = useState(1)
  const [csvItemsPerPage, setCsvItemsPerPage] = useState(10)
  const [usersCurrentPage, setUsersCurrentPage] = useState(1)
  const [usersItemsPerPage, setUsersItemsPerPage] = useState(10)

  // Create user form states
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user')
  const [creatingUser, setCreatingUser] = useState(false)

  // Edit user form states
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user')
  const [updatingUser, setUpdatingUser] = useState(false)

  // WebSocket connection for real-time updates
  useWebSocket(token, (data: WebSocketMessage) => {
    if (data.event === 'csv_list_updated') {
      if (data.action === 'uploaded' && data.file) {
        // Reload the list silently for instant update
        loadCSVFiles()
        notifications.show({
          title: 'New CSV uploaded',
          message: `${data.file.filename} was uploaded`,
          color: 'blue',
        })
      } else if (data.action === 'deleted') {
        // Remove from state immediately for instant feedback
        setCsvFiles((prev: CSVFile[]) => prev.filter((f: CSVFile) => f.id !== data.file_id))
        // Also reload to ensure consistency
        loadCSVFiles()
        notifications.show({
          title: 'CSV deleted',
          message: 'A CSV file was deleted',
          color: 'orange',
        })
      }
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

  const loadUsers = useCallback(async () => {
    try {
      const userList = await UsersService.list()
      setUsers(userList)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load users'
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
      await Promise.all([loadCSVFiles(), loadUsers()])
      setLoading(false)
    }
    loadData()
  }, [loadCSVFiles, loadUsers])

  const handleFileUpload = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    try {
      await CSVService.upload(file)
      notifications.show({
        title: 'Success',
        message: 'CSV file uploaded successfully',
        color: 'green',
      })
      await loadCSVFiles()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload file'
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async () => {
    if (!deleteFileId) return
    try {
      await CSVService.delete(deleteFileId)
      notifications.show({
        title: 'Success',
        message: 'CSV file deleted successfully',
        color: 'green',
      })
      setDeleteFileId(null)
      await loadCSVFiles()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete file'
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteUserId) return
    try {
      await UsersService.delete(deleteUserId)
      notifications.show({
        title: 'Success',
        message: 'User deleted successfully',
        color: 'green',
      })
      setDeleteUserId(null)
      await loadUsers()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user'
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      })
    }
  }

  const handleViewFile = (fileId: number) => {
    navigate(`/csv/${fileId}/view`)
  }

  const handleCreateUser = async () => {
    if (!newUsername || !newEmail || !newPassword) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all fields',
        color: 'red',
      })
      return
    }

    setCreatingUser(true)
    try {
      await signup(newUsername, newEmail, newPassword, newRole)
      notifications.show({
        title: 'Success',
        message: 'User created successfully',
        color: 'green',
      })
      setCreateUserModalOpen(false)
      setNewUsername('')
      setNewEmail('')
      setNewPassword('')
      setNewRole('user')
      await loadUsers()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user'
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      })
    } finally {
      setCreatingUser(false)
    }
  }

  const handleEditUser = (userId: number) => {
    const userToEdit = users.find((u) => u.id === userId)
    if (!userToEdit) return

    setEditingUserId(userId)
    setEditUsername(userToEdit.username)
    setEditEmail(userToEdit.email)
    setEditPassword('')
    setEditRole(userToEdit.role)
    setEditUserModalOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUserId) return
    if (!editUsername || !editEmail) {
      notifications.show({
        title: 'Error',
        message: 'Username and email are required',
        color: 'red',
      })
      return
    }

    setUpdatingUser(true)
    try {
      const updateData: {
        username?: string
        email?: string
        password?: string
        role?: 'user' | 'admin'
      } = {
        username: editUsername,
        email: editEmail,
        role: editRole,
      }

      // Only include password if it's been changed
      if (editPassword) {
        updateData.password = editPassword
      }

      await UsersService.update(editingUserId, updateData)
      notifications.show({
        title: 'Success',
        message: 'User updated successfully',
        color: 'green',
      })
      setEditUserModalOpen(false)
      setEditingUserId(null)
      setEditUsername('')
      setEditEmail('')
      setEditPassword('')
      setEditRole('user')
      await loadUsers()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user'
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      })
    } finally {
      setUpdatingUser(false)
    }
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

  // Pagination calculations for CSV files
  const csvTotalPages = Math.ceil(csvFiles.length / csvItemsPerPage)
  const csvStartIndex = (csvCurrentPage - 1) * csvItemsPerPage
  const csvEndIndex = csvStartIndex + csvItemsPerPage
  const paginatedCsvFiles = csvFiles.slice(csvStartIndex, csvEndIndex)

  // Pagination calculations for users
  const usersTotalPages = Math.ceil(users.length / usersItemsPerPage)
  const usersStartIndex = (usersCurrentPage - 1) * usersItemsPerPage
  const usersEndIndex = usersStartIndex + usersItemsPerPage
  const paginatedUsers = users.slice(usersStartIndex, usersEndIndex)

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
        <Title>Admin Dashboard</Title>
        <Group>
          <Text>Welcome, {user?.username}</Text>
          <Button leftSection={<IconLogout size={16} />} variant="light" onClick={logout}>
            Logout
          </Button>
        </Group>
      </Group>

      <Tabs defaultValue="csv">
        <Tabs.List>
          <Tabs.Tab value="csv">CSV Files</Tabs.Tab>
          <Tabs.Tab value="users">Users</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="csv" pt="xl">
          <Paper p="md" mb="md" withBorder>
            <Group justify="space-between" align="flex-end">
              <div className="grid">
                <div className="flex gap-4 items-center">
                  <Title order={3}>CSV Files</Title>
                  <FileButton onChange={handleFileUpload} accept=".csv" disabled={uploading}>
                    {(props) => (
                      <Button
                        size='sm'
                        leftSection={<IconUpload size={16} />}
                        loading={uploading}
                        {...props}
                      >
                        Upload CSV
                      </Button>
                    )}
                  </FileButton>
                </div>
                <Text size="sm" c="dimmed" fw={500}>
                  Total: {csvFiles.length} files
                </Text>
              </div>

              <Group gap="md" align="flex-end">
                <Select
                  label="Items per page"
                  value={csvItemsPerPage.toString()}
                  onChange={(value) => {
                    setCsvItemsPerPage(parseInt(value || '10'))
                    setCsvCurrentPage(1)
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
                {paginatedCsvFiles.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5} ta="center">
                      <Text c="dimmed">No CSV files uploaded yet</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  paginatedCsvFiles.map((file: CSVFile) => (
                    <Table.Tr key={file.id}>
                      <Table.Td>
                        <span className='font-bold hover:text-blue-500 cursor-pointer' onClick={() => handleViewFile(file.id)}>
                          {file.filename}
                        </span>
                      </Table.Td>
                      <Table.Td>{formatFileSize(file.file_size)}</Table.Td>
                      <Table.Td>{file.uploader_username}</Table.Td>
                      <Table.Td>{new Date(file.uploaded_at).toLocaleString()}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            color="blue"
                            variant="light"
                            onClick={() => handleViewFile(file.id)}
                            title="View"
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon
                            color="green"
                            variant="light"
                            onClick={() => handleDownloadFile(file.id, file.filename)}
                            title="Download"
                          >
                            <IconDownload size={16} />
                          </ActionIcon>
                          <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => setDeleteFileId(file.id)}
                            title="Delete"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Paper>

          {csvTotalPages > 1 && (
            <Paper p="md" mt="md" withBorder>
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Page {csvCurrentPage} of {csvTotalPages} ({csvFiles.length} total files)
                </Text>
                <Pagination
                  value={csvCurrentPage}
                  onChange={setCsvCurrentPage}
                  total={csvTotalPages}
                  size="sm"
                />
              </Group>
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="xl">
          <Paper p="md" mb="md" withBorder>
            <Group justify="space-between" align="flex-end">
              <section>

                <div className="flex gap-4 items-center">
                  <Title order={3}>User Details</Title>
                  <Button size="sm" onClick={() => setCreateUserModalOpen(true)}>Create New User</Button>
                </div>
                <Text size="sm" c="dimmed" fw={500}>
                  Total: {users.length} users
                </Text>
              </section>
              <Group gap="md" align="flex-end">

                <Select
                  label="Items per page"
                  value={usersItemsPerPage.toString()}
                  onChange={(value) => {
                    setUsersItemsPerPage(parseInt(value || '10'))
                    setUsersCurrentPage(1)
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
            </Group>
          </Paper>

          <Paper withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Created At</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedUsers.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} ta="center">
                      <Text c="dimmed">No users found</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  paginatedUsers.map((u: User) => (
                    <Table.Tr key={u.id}>
                      <Table.Td>{u.id}</Table.Td>
                      <Table.Td>{u.username}</Table.Td>
                      <Table.Td>{u.email}</Table.Td>
                      <Table.Td>{u.role}</Table.Td>
                      <Table.Td>{new Date(u.created_at).toLocaleString()}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            color="blue"
                            variant="light"
                            onClick={() => handleEditUser(u.id)}
                            title="Edit"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          {u.id !== user?.id && (
                            <ActionIcon
                              color="red"
                              variant="light"
                              onClick={() => setDeleteUserId(u.id)}
                              title="Delete"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Paper>

          {usersTotalPages > 1 && (
            <Paper p="md" mt="md" withBorder>
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Page {usersCurrentPage} of {usersTotalPages} ({users.length} total users)
                </Text>
                <Pagination
                  value={usersCurrentPage}
                  onChange={setUsersCurrentPage}
                  total={usersTotalPages}
                  size="sm"
                />
              </Group>
            </Paper>
          )}
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={deleteFileId !== null}
        onClose={() => setDeleteFileId(null)}
        title="Delete CSV File"
      >
        <Text>Are you sure you want to delete this CSV file?</Text>
        <Group mt="md" justify="flex-end">
          <Button variant="light" onClick={() => setDeleteFileId(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteFile}>
            Delete
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={deleteUserId !== null}
        onClose={() => setDeleteUserId(null)}
        title="Delete User"
      >
        <Text>Are you sure you want to delete this user?</Text>
        <Group mt="md" justify="flex-end">
          <Button variant="light" onClick={() => setDeleteUserId(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteUser}>
            Delete
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={createUserModalOpen}
        onClose={() => {
          setCreateUserModalOpen(false)
          setNewUsername('')
          setNewEmail('')
          setNewPassword('')
          setNewRole('user')
        }}
        title="Create New User"
        size="md"
      >
        <TextInput
          label="Username"
          placeholder="Enter username"
          required
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          mb="md"
        />
        <TextInput
          label="Email"
          type="email"
          placeholder="Enter email address"
          required
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          mb="md"
        />
        <TextInput
          label="Password"
          type="password"
          placeholder="Enter password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          mb="md"
        />
        <Select
          label="Role"
          data={[
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
          ]}
          value={newRole}
          onChange={(value) => setNewRole((value as 'user' | 'admin') || 'user')}
          mb="xl"
        />
        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            onClick={() => {
              setCreateUserModalOpen(false)
              setNewUsername('')
              setNewEmail('')
              setNewPassword('')
              setNewRole('user')
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateUser} loading={creatingUser}>
            Create User
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={editUserModalOpen}
        onClose={() => {
          setEditUserModalOpen(false)
          setEditingUserId(null)
          setEditUsername('')
          setEditEmail('')
          setEditPassword('')
          setEditRole('user')
        }}
        title="Edit User"
        size="md"
      >
        <TextInput
          label="Username"
          placeholder="Enter username"
          required
          value={editUsername}
          onChange={(e) => setEditUsername(e.target.value)}
          mb="md"
        />
        <TextInput
          label="Email"
          type="email"
          placeholder="Enter email address"
          required
          value={editEmail}
          onChange={(e) => setEditEmail(e.target.value)}
          mb="md"
        />
        <TextInput
          label="Password"
          type="password"
          placeholder="Leave empty to keep current password"
          value={editPassword}
          onChange={(e) => setEditPassword(e.target.value)}
          mb="md"
        />
        <Select
          label="Role"
          data={[
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
          ]}
          value={editRole}
          onChange={(value) => setEditRole((value as 'user' | 'admin') || 'user')}
          mb="xl"
        />
        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            onClick={() => {
              setEditUserModalOpen(false)
              setEditingUserId(null)
              setEditUsername('')
              setEditEmail('')
              setEditPassword('')
              setEditRole('user')
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} loading={updatingUser}>
            Update User
          </Button>
        </Group>
      </Modal>
    </Container >
  )
}
