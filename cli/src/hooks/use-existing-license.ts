import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { useEffect, useState } from 'react'

function useExistingLicense() {
  const [needsLicense, setNeedsLicense] = useState<boolean | null>(null)
  const [existingLicense, setExistingLicense] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkLicense = async () => {
      try {
        // Check for LICENSE file
        const cwd = process.cwd()
        const licenseFiles = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'license.md', 'license.txt']

        for (const file of licenseFiles) {
          if (existsSync(join(cwd, file))) {
            setExistingLicense(`Found license file: ${file}`)
            setNeedsLicense(false)
            return
          }
        }

        // Check package.json
        const packageJsonPath = join(cwd, 'package.json')
        if (existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
          if (packageJson.license && packageJson.license !== 'UNLICENSED') {
            setExistingLicense(`Found license in package.json: ${packageJson.license}`)
            setNeedsLicense(false)
            return
          }
        }

        // No license found
        setNeedsLicense(true)
      }
      catch (err) {
        setError(`Error checking license: ${err instanceof Error ? err.message : String(err)}`)
        setNeedsLicense(false)
      }
    }

    checkLicense()
  }, [])

  return { needsLicense, existingLicense, error }
}

export { useExistingLicense }
