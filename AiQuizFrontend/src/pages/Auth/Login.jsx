import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import Layout from './Layout'
import { loginUser } from '../../store/actions/authActions'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import MainLogo from './MainLogo'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import formatErrorMessages from '@/lib/formatErrorMessages'

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  })
});

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values) => {
    setLoading(true)
    const res =  await dispatch(loginUser(values));
    if (res.status === 200 || res.status === 201) {
      setLoading(false)
      toast.success("Login Successful");
      navigate('/')
    }else{
      setLoading(false)
      toast.error(formatErrorMessages(res?.response?.data))
    }
  }

  return (
    <Layout>
      <Card className="w-full sm:w-[450px] shadow-lg border-0 rounded">
        <CardHeader className="items-center">
          <MainLogo />
          <CardTitle className="text-xl font-bold text-center">Login In</CardTitle>
          <CardDescription className="text-sm text-center">Welcome back! Please Login to continue</CardDescription>
        </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email" {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Your password" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
        </CardContent>
        <CardFooter className="flex justify-center flex-col">
          <Button
            className="mt-2 py-2 px-4 rounded w-full flex bg-blue-500 hover:bg-blue-600"
            type="submit"
            disabled={loading}
            >
            {
              loading ? 'Loading...' : 'Login'
              }
          </Button>
          <div className='mt-2'>
            <p className="text-sm mt-2">{"Don't have an account"}?&nbsp;
              <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
            </p>
          </div>
        </CardFooter>
            </form>
      </Form>
      </Card>
    </Layout>
  )
}

export default Login