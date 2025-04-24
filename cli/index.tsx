#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import figures from 'figures'
import { Box, render, Text } from 'ink'
import React, { useState } from 'react'

import LicenseFetcher from './src/components/LicenseFetcher'

interface LicenseDetails {
  body: string
  name: string
}

function App() {
  const [licenseAdded, setLicenseAdded] = useState(false)

  const handleLicenseComplete = (licenseDetails: LicenseDetails | null) => {
    if (licenseDetails) {
      try {
        // Write license to file
        writeFileSync(join(process.cwd(), 'LICENSE'), licenseDetails.body)

        // Update package.json if it exists
        const packageJsonPath = join(process.cwd(), 'package.json')
        if (existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
          packageJson.license = licenseDetails.name
          writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
        }

        setLicenseAdded(true)
      }
      catch (err) {
        console.error('Failed to write license file:', err)
      }
    }
  }

  return (
    <Box flexDirection="column" padding={1}>
      {!licenseAdded
        ? (
            <LicenseFetcher onComplete={handleLicenseComplete} />
          )
        : (
            <Text color="green">
              {figures.tick}
              {' '}
              License added successfully!
            </Text>
          )}
    </Box>
  )
}

render(<App />)
