'use client'

import { ArrowRight, Check, Copy, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import spdxLicenseList from 'spdx-license-list'
import spdxSimple from 'spdx-license-list/simple'
import { VList } from 'virtua'

interface License {
  key: string
  name: string
  description?: string
  category?: string
  popular?: boolean
}

const POPULAR_LICENSES: License[] = [
  {
    key: 'MIT',
    name: 'MIT License',
    description: 'A short and simple permissive license with conditions only requiring preservation of copyright and license notices.',
    category: 'Permissive',
    popular: true,
  },
  {
    key: 'Apache-2.0',
    name: 'Apache License 2.0',
    description: 'A permissive license that also provides an express grant of patent rights from contributors to users.',
    category: 'Permissive',
    popular: true,
  },
  {
    key: 'GPL-3.0-only',
    name: 'GNU General Public License v3.0',
    description: 'Permissions of this strong copyleft license are conditioned on making available complete source code.',
    category: 'Copyleft',
    popular: true,
  },
  {
    key: 'BSD-3-Clause',
    name: 'BSD 3-Clause License',
    description: 'A permissive license similar to the BSD 2-Clause License, but with a 3rd clause that prohibits others from using the name of the project or its contributors to promote derived products without written consent.',
    category: 'Permissive',
    popular: true,
  },
  {
    key: 'BSD-2-Clause',
    name: 'BSD 2-Clause License',
    description: 'A permissive license that comes in two variants, the BSD 2-Clause and BSD 3-Clause.',
    category: 'Permissive',
    popular: true,
  },
  {
    key: 'MPL-2.0',
    name: 'Mozilla Public License 2.0',
    description: 'A weak copyleft license that permits integration with proprietary software, but requires the licensed components to remain open source.',
    category: 'Weak Copyleft',
    popular: true,
  },
  {
    key: 'ISC',
    name: 'ISC License',
    description: 'A permissive license lets people do anything with your code with proper attribution and without warranty.',
    category: 'Permissive',
    popular: true,
  },
  {
    key: 'Unlicense',
    name: 'The Unlicense',
    description: 'A license with no conditions whatsoever which dedicates works to the public domain.',
    category: 'Public Domain',
    popular: true,
  },
]

const CATEGORIES = [
  'All',
  'Permissive',
  'Copyleft',
  'Weak Copyleft',
  'Public Domain',
]

const CATEGORY_COLORS: Record<string, { bg: string, text: string }> = {
  'Permissive': { bg: 'rgba(96, 165, 250, 0.1)', text: 'rgb(96, 165, 250)' },
  'Copyleft': { bg: 'rgba(248, 113, 113, 0.1)', text: 'rgb(248, 113, 113)' },
  'Weak Copyleft': { bg: 'rgba(168, 85, 247, 0.1)', text: 'rgb(168, 85, 247)' },
  'Public Domain': { bg: 'rgba(52, 211, 153, 0.1)', text: 'rgb(52, 211, 153)' },
  'Other': { bg: 'rgba(156, 163, 175, 0.1)', text: 'rgb(156, 163, 175)' },
  'Popular': { bg: 'rgba(251, 191, 36, 0.1)', text: 'rgb(251, 191, 36)' },
}

function LicenseItem({ license, isSelected, onClick }: Readonly<{
  license: License
  isSelected: boolean
  onClick: () => void
}>) {
  return (
    <motion.div
      className={`p-6 cursor-pointer transition-all ${
        isSelected ? 'bg-[#1A1A1A]' : 'hover:bg-[#1A1A1A]'
      }`}
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xl font-medium text-white">
            {license.name}
          </h4>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#222222] text-white">
              {license.key}
            </span>
            {license.popular && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: CATEGORY_COLORS.Popular.bg,
                  color: CATEGORY_COLORS.Popular.text,
                }}
              >
                Popular
              </span>
            )}
            {license.category && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: CATEGORY_COLORS[license.category]?.bg || CATEGORY_COLORS.Other.bg,
                  color: CATEGORY_COLORS[license.category]?.text || CATEGORY_COLORS.Other.text,
                }}
              >
                {license.category}
              </span>
            )}
          </div>
          {license.description && (
            <p className="mt-3 text-sm text-[#868F97]">
              {license.description}
            </p>
          )}
        </div>
        <motion.div
          whileHover={{ x: 5 }}
          className="text-[#868F97]"
        >
          <ArrowRight className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [copied, setCopied] = useState(false)
  const [allLicenses, setAllLicenses] = useState<License[]>([])

  // Initialize all licenses
  useEffect(() => {
    const licenses: License[] = [...POPULAR_LICENSES]

    // Add all other SPDX licenses
    const spdxLicenses = Array.from(spdxSimple)
    spdxLicenses.forEach((key) => {
      if (!licenses.some(l => l.key === key)) {
        const info = spdxLicenseList[key]
        if (info) {
          licenses.push({
            key,
            name: info.name,
            category: 'Other',
          })
        }
      }
    })

    setAllLicenses(licenses)
  }, [])

  const filteredLicenses = useMemo(() => {
    return allLicenses.filter((license) => {
      const matchesSearch
        = license.name.toLowerCase().includes(searchTerm.toLowerCase())
          || license.key.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory
        = selectedCategory === 'All'
          || license.category === selectedCategory

      return matchesSearch && matchesCategory
    }).sort((a, b) => {
      if (a.popular && !b.popular)
        return -1
      if (!a.popular && b.popular)
        return 1
      return a.name.localeCompare(b.name)
    })
  }, [allLicenses, searchTerm, selectedCategory])

  // Generate CLI command for selected license
  const cliCommand = selectedLicense
    ? `npx community-health-files license add ${selectedLicense.key}`
    : ''

  // Copy command to clipboard
  const copyCommand = () => {
    if (cliCommand) {
      navigator.clipboard.writeText(cliCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#868F97]">
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-[500px] mx-auto mb-24"
        >
          <h2 className="font-semibold text-6xl leading-[1.1] text-white mb-6 tracking-tight">
            The right license for your code.
          </h2>
          <p className="font-normal text-xl leading-[1.5] text-[#868F97]">
            Choose from hundreds of open source licenses and add them to your project in seconds.
          </p>
        </motion.div>

        {/* Search and filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16 max-w-3xl mx-auto"
        >
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
              <Search className="w-5 h-5 text-[#868F97]" />
            </div>
            <input
              type="text"
              className="block w-full p-5 pl-14 text-base text-white border-0 rounded-2xl bg-[#111111] focus:ring-2 focus:ring-[#3E63DD] placeholder-[#868F97] shadow-lg"
              placeholder="Search for a license..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map(category => (
              <motion.button
                key={category}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-[#111111] text-white hover:bg-[#222222]'
                }`}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {/* License list with virtualization */}
          <div className="lg:col-span-2 bg-[#111111] rounded-3xl overflow-hidden backdrop-blur-lg shadow-2xl">
            <div className="p-6 border-b border-[#222222]">
              <h3 className="text-xl font-medium text-white">
                Available Licenses (
                {filteredLicenses.length}
                )
              </h3>
            </div>

            <div className="h-[600px]">
              {filteredLicenses.length > 0
                ? (
                    <VList className="divide-y divide-[#222222]">
                      {filteredLicenses.map(license => (
                        <LicenseItem
                          key={license.key}
                          license={license}
                          isSelected={selectedLicense?.key === license.key}
                          onClick={() => setSelectedLicense(license)}
                        />
                      ))}
                    </VList>
                  )
                : (
                    <div className="p-12 text-center text-[#868F97]">
                      No licenses found matching your criteria
                    </div>
                  )}
            </div>
          </div>

          {/* License details and CLI command */}
          <div className="bg-[#111111] rounded-3xl p-8 backdrop-blur-lg shadow-2xl">
            <AnimatePresence mode="wait">
              {selectedLicense
                ? (
                    <motion.div
                      key="license-details"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-2xl font-semibold text-white mb-4">
                        {selectedLicense.name}
                      </h3>

                      {selectedLicense.description && (
                        <p className="text-[#868F97] mb-8">
                          {selectedLicense.description}
                        </p>
                      )}

                      <div className="mb-8">
                        <h4 className="text-lg font-medium text-white mb-4">
                          CLI Command
                        </h4>
                        <div className="relative">
                          <motion.div
                            className="bg-[#0A0A0A] rounded-2xl p-5 pr-14 font-mono text-sm text-[#A4CDFE] overflow-x-auto border border-[#222222]"
                            whileHover={{ borderColor: '#3E63DD' }}
                            transition={{ duration: 0.2 }}
                          >
                            {cliCommand}
                          </motion.div>
                          <motion.button
                            className="absolute right-4 top-4 p-2 rounded-full bg-[#222222] hover:bg-[#333333] transition-colors"
                            onClick={copyCommand}
                            aria-label="Copy to clipboard"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {copied
                              ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                )
                              : (
                                  <Copy className="w-4 h-4 text-[#868F97]" />
                                )}
                          </motion.button>
                        </div>
                        <motion.p
                          className="mt-4 text-sm text-[#868F97] flex items-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          Run this command in your project directory to add the license
                        </motion.p>
                      </div>

                      <motion.div
                        className="mt-8 pt-8 border-t border-[#222222]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.a
                          href={`https://spdx.org/licenses/${selectedLicense.key}.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-white font-medium group"
                          whileHover={{ x: 5 }}
                        >
                          View full license text
                          <motion.span
                            className="ml-2 group-hover:ml-3 transition-all"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.span>
                        </motion.a>
                      </motion.div>
                    </motion.div>
                  )
                : (
                    <motion.div
                      key="license-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="h-full flex flex-col items-center justify-center text-center p-6"
                    >
                      <motion.div
                        className="w-20 h-20 bg-[#222222] rounded-full flex items-center justify-center mb-6"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 3,
                          ease: 'easeInOut',
                        }}
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 8V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                      <h3 className="text-xl font-medium text-white mb-3">
                        Select a License
                      </h3>
                      <p className="text-[#868F97]">
                        Choose a license from the list to see details and generate a CLI command
                      </p>
                    </motion.div>
                  )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
