import process from 'node:process'
import { Select, Spinner, TextInput } from '@inkjs/ui'
import figures from 'figures'
import { Box, Text, useInput } from 'ink'
import React, { useState } from 'react'
import spdxFullLicenses from 'spdx-license-list/full.js'
import spdxLicenseList from 'spdx-license-list/simple.js'
import { useExistingLicense } from '../hooks/use-existing-license'

interface License {
  key: string
  name: string
  description?: string
}

interface LicenseDetails {
  body: string
  name: string
}

// Convert SPDX license list to our format
const POPULAR_LICENSES: License[] = [
  {
    key: 'MIT',
    name: 'MIT License',
    description: 'A short and simple permissive license with conditions only requiring preservation of copyright and license notices.',
  },
  {
    key: 'Apache-2.0',
    name: 'Apache License 2.0',
    description: 'A permissive license that also provides an express grant of patent rights from contributors to users.',
  },
  {
    key: 'GPL-3.0-only',
    name: 'GNU General Public License v3.0',
    description: 'Permissions of this strong copyleft license are conditioned on making available complete source code.',
  },
  {
    key: 'BSD-3-Clause',
    name: 'BSD 3-Clause License',
    description: 'A permissive license similar to the BSD 2-Clause License, but with a 3rd clause that prohibits others from using the name of the project or its contributors to promote derived products without written consent.',
  },
  {
    key: 'BSD-2-Clause',
    name: 'BSD 2-Clause License',
    description: 'A permissive license that comes in two variants, the BSD 2-Clause and BSD 3-Clause.',
  },
  {
    key: 'MPL-2.0',
    name: 'Mozilla Public License 2.0',
    description: 'A weak copyleft license that permits integration with proprietary software, but requires the licensed components to remain open source.',
  },
  {
    key: 'ISC',
    name: 'ISC License',
    description: 'A permissive license lets people do anything with your code with proper attribution and without warranty.',
  },
  {
    key: 'Unlicense',
    name: 'The Unlicense',
    description: 'A license with no conditions whatsoever which dedicates works to the public domain.',
  },
]

const ALL_LICENSES = Array.from(spdxLicenseList)

function ResponsiveBox({ children, ...props }: any) {
  return (
    <Box
      borderStyle="round"
      padding={1}
      flexDirection="column"
      width={process.stdout.columns > 100 ? 100 : process.stdout.columns - 4}
      {...props}
    >
      {children}
    </Box>
  )
}

function LicenseFetcher({ onComplete }: Readonly<{ onComplete: (license: LicenseDetails | null) => void }>) {
  const [loading, setLoading] = useState(false)
  const { needsLicense, existingLicense, error: checkError } = useExistingLicense()
  const [error, setError] = useState<string | null>(checkError || null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [step, setStep] = useState<'select' | 'preview'>('select')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Get license text from SPDX
  const getLicense = (licenseKey: string) => {
    setLoading(true)
    setError(null)

    try {
      // Find the exact license key with correct case
      const exactKey = ALL_LICENSES.find(l => l.toLowerCase() === licenseKey.toLowerCase())

      if (!exactKey) {
        throw new Error(`License "${licenseKey}" not found in SPDX license list`)
      }

      // Get license text from full licenses
      const licenseData = spdxFullLicenses[exactKey]

      if (!licenseData?.licenseText) {
        throw new Error(`License text for "${exactKey}" not available`)
      }

      // Get the license text with placeholders intact
      const licenseText = licenseData.licenseText

      setLoading(false)
      onComplete({
        body: licenseText,
        name: licenseData.name,
      })
    }
    catch (err) {
      setLoading(false)
      setError(`Failed to get license: ${err instanceof Error ? err.message : String(err)}`)
      setStep('select')
    }
  }

  // Handle keyboard shortcuts
  useInput((input, key) => {
    if (key.escape) {
      if (step === 'preview') {
        setStep('select')
        setValidationError(null)
      }
      else if (showCustomInput) {
        setShowCustomInput(false)
        setValidationError(null)
      }
    }

    if (input === 'c' && step === 'select' && !showCustomInput) {
      setShowCustomInput(true)
    }
  })

  const handleLicenseSelect = (value: string) => {
    setStep('preview')
    getLicense(value)
  }

  const handleCustomLicenseSubmit = (value: string) => {
    if (!value.trim()) {
      setValidationError('License key cannot be empty')
      return
    }

    // Check if license exists in SPDX list
    const licenseExists = ALL_LICENSES.some(
      l => l.toLowerCase() === value.toLowerCase(),
    )

    if (!licenseExists) {
      setValidationError('License not found in SPDX license list')
      return
    }

    // Find the exact license key with correct case
    const exactKey = ALL_LICENSES.find(l => l.toLowerCase() === value.toLowerCase()) || value

    setStep('preview')
    getLicense(exactKey)
  }

  if (needsLicense === null) {
    return (
      <ResponsiveBox borderColor="blue">
        <Box>
          <Spinner type="dots" />
          <Text color="cyanBright"> Checking for existing license...</Text>
        </Box>
      </ResponsiveBox>
    )
  }

  if (needsLicense === false) {
    return (
      <ResponsiveBox borderColor="green">
        <Text color="greenBright">
          {figures.tick}
          {' '}
          License already exists
        </Text>
        {existingLicense && <Text>{existingLicense}</Text>}
        <Box marginY={1}>
          <Text>No action needed.</Text>
        </Box>
      </ResponsiveBox>
    )
  }

  if (error) {
    return (
      <ResponsiveBox borderColor="red">
        <Text color="redBright">
          {figures.cross}
          {' '}
          Error
        </Text>
        <Text>{error}</Text>
      </ResponsiveBox>
    )
  }

  if (loading) {
    return (
      <ResponsiveBox borderColor="yellow">
        <Box>
          <Spinner type="dots" />
          <Text color="yellowBright"> Generating license...</Text>
        </Box>
      </ResponsiveBox>
    )
  }

  if (step === 'select') {
    return (
      <ResponsiveBox borderColor="cyan">
        <Box marginBottom={1}>
          <Text bold color="cyanBright">
            {figures.pointer}
            {' '}
            License Selection
          </Text>
        </Box>

        <Text>No license found. Select a license to add:</Text>

        {!showCustomInput
          ? (
              <>
                <Box marginY={1}>
                  <Select
                    options={POPULAR_LICENSES.map(license => ({
                      label: license.name,
                      value: license.key,
                    }))}
                    onChange={handleLicenseSelect}
                  />
                </Box>

                <Box marginY={1}>
                  <Text dimColor>
                    Press
                    {' '}
                    <Text color="cyanBright">c</Text>
                    {' '}
                    to enter a custom license key
                  </Text>
                </Box>
              </>
            )
          : (
              <Box marginY={1} flexDirection="column">
                <Text>Enter a license key (e.g. MIT, Apache-2.0):</Text>
                <TextInput
                  placeholder="Type a license key..."
                  suggestions={ALL_LICENSES}
                  onSubmit={handleCustomLicenseSubmit}
                />
                {validationError && (
                  <Box marginY={1}>
                    <Text color="redBright">
                      {figures.cross}
                      {' '}
                      {validationError}
                    </Text>
                  </Box>
                )}
                <Box marginY={1}>
                  <Text dimColor>
                    Press
                    {' '}
                    <Text color="cyanBright">Esc</Text>
                    {' '}
                    to go back to selection
                  </Text>
                </Box>
              </Box>
            )}
      </ResponsiveBox>
    )
  }

  return (
    <ResponsiveBox borderColor="magenta">
      <Box marginBottom={1}>
        <Text bold color="magentaBright">
          {figures.pointer}
          {' '}
          License Preview
        </Text>
      </Box>

      <Box>
        <Spinner type="dots" />
        <Text color="magentaBright"> Generating license...</Text>
      </Box>

      <Box marginY={1}>
        <Text color="yellowBright">
          {figures.info}
          {' '}
          Note: Remember to customize the license with your copyright information.
        </Text>
      </Box>
    </ResponsiveBox>
  )
}

export default LicenseFetcher
