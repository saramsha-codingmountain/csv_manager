/**
 * Signup Page - Admin Only (Create New Users)
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, TextInput, Paper, Title, Text, Container, Select } from '@mantine/core'
import { notifications } from '@mantine/notifications'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [loading, setLoading] = useState(false)
  const { user, signup } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      notifications.show({
        title: 'Access Denied',
        message: 'Only admins can create new users',
        color: 'red',
      })
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signup(username, email, password, role)
      notifications.show({
        title: 'Success',
        message: 'User created successfully',
        color: 'green',
      })
      // Reset form
      setUsername('')
      setEmail('')
      setPassword('')
      setRole('user')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user'
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Text ta="center" c="red">
            Access Denied. Only admins can create new users.
          </Text>
        </Paper>
      </Container>
    )
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="md">
        CSV Manager
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5} mb="xl">
        Create a new user account
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Username"
            placeholder="Enter username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            mb="md"
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="Enter email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            mb="md"
          />
          <TextInput
            label="Password"
            type="password"
            placeholder="Enter password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            mb="md"
          />
          <Select
            label="Role"
            data={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
            value={role}
            onChange={(value) => setRole(value as 'user' | 'admin')}
            mb="xl"
          />
          <Button type="submit" fullWidth loading={loading}>
            Create User
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
