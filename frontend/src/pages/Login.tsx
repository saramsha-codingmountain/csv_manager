/**
 * Login Page
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, TextInput, Paper, Title, Text, Container } from '@mantine/core'
import { notifications } from '@mantine/notifications'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      notifications.show({
        title: 'Success',
        message: 'Logged in successfully',
        color: 'green',
      })
      navigate('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to log in'
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="md">
        CSV Manager
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5} mb="xl">
        Log in to your account
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            mb="md"
          />
          <TextInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            mb="xl"
          />
          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>

        <Text size="sm" ta="center" mt="md">
          Don't have an account? Contact an admin to create one.
        </Text>
      </Paper>
    </Container>
  )
}
