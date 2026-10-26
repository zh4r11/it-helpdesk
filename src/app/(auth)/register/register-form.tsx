"use client";

import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@/hooks/use-form";
import { daftar } from "./actions";

export function RegisterForm({ passwordRules }: { passwordRules: string }) {
  const form = useForm({
    name: "",
    nip: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit(daftar, {
          onSuccess: () => form.setData((data) => ({ ...data, password: "", password_confirmation: "" })),
        });
      }}
    >
      <fieldset className="grid gap-5" disabled={form.processing}>
        <div className="grid gap-2">
          <Label htmlFor="name">Nama lengkap</Label>
          <Input
            id="name"
            value={form.data.name}
            onChange={(e) => form.setData("name", e.target.value)}
            required
            autoFocus
            autoComplete="name"
            placeholder="Nama lengkap"
            aria-invalid={!!form.errors.name}
          />
          <InputError message={form.errors.name} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="nip">NIK / NIP</Label>
            <Input
              id="nip"
              value={form.data.nip}
              onChange={(e) => form.setData("nip", e.target.value)}
              required
              placeholder="Nomor induk"
              aria-invalid={!!form.errors.nip}
            />
            <InputError message={form.errors.nip} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={form.data.username}
              onChange={(e) => form.setData("username", e.target.value)}
              required
              autoComplete="username"
              placeholder="username"
              aria-invalid={!!form.errors.username}
            />
            <InputError message={form.errors.username} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Alamat email</Label>
          <Input
            id="email"
            type="email"
            value={form.data.email}
            onChange={(e) => form.setData("email", e.target.value)}
            required
            autoComplete="email"
            placeholder="email@perusahaan.com"
            aria-invalid={!!form.errors.email}
          />
          <InputError message={form.errors.email} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={form.data.password}
            onChange={(e) => form.setData("password", e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Password"
            passwordrules={passwordRules}
            aria-invalid={!!form.errors.password}
          />
          <InputError message={form.errors.password} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password_confirmation">Konfirmasi password</Label>
          <PasswordInput
            id="password_confirmation"
            value={form.data.password_confirmation}
            onChange={(e) => form.setData("password_confirmation", e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Ulangi password"
            aria-invalid={!!form.errors.password_confirmation}
          />
          <InputError message={form.errors.password_confirmation} />
        </div>

        <Button type="submit" className="mt-2 w-full">
          {form.processing && <Spinner />}
          Daftar
        </Button>
      </fieldset>

      <p className="text-center text-xs text-muted-foreground">
        Akun baru perlu diaktifkan oleh admin sebelum dapat digunakan.
      </p>

      <div className="text-center text-sm text-muted-foreground">
        Sudah punya akun? <TextLink href="/login">Masuk</TextLink>
      </div>
    </form>
  );
}
