import Image from 'next/image'

export function Logo() {
  return <Image src="/logo.webp" alt="Logo Leandro Lopez" width={250} height={250} priority />
}
