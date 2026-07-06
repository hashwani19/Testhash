import { useState } from 'react'
import type { AuditAction, AuditEntityType, AuditLogEntry, User } from '../types'
import { MIN_SEARCH_LENGTH } from '../utils/patientQuery'
import { useAuditLogQuery } from '../hooks/useAuditLogQuery'
import { Button } from './common/Button'
import { SearchBox } from './common/SearchBox'
import { Select } from './common/Select'
import { TextInput } from './common/TextInput'
import { ListView } from './common/ListView'
import { Card, cardBase } from './common/Card'
import { Breadcrumb } from './common/Breadcrumb'
import { screenHeading, fieldLabel, fieldLabelText, cx } from '../styles'

interface Props {
  entries: AuditLogEntry[]
  users: User[]
  onBack: () => void
}

const ACTION_LABELS: Record<AuditAction, string> = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
}

const ENTITY_TYPE_LABELS: Record<AuditEntityType, string> = {
  patient: 'patient',
  patient_group: 'patient group',
  eye_visit: 'eye record',
  appointment: 'appointment',
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function AuditEntryDetail({ entry, onBack }: { entry: AuditLogEntry; onBack: () => void }) {
  const before = entry.beforeJson ? (JSON.parse(entry.beforeJson) as unknown) : null
  const after = entry.afterJson ? (JSON.parse(entry.afterJson) as unknown) : null

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb label="Activity" onClick={onBack} />
      <h2 className={screenHeading}>Activity detail</h2>

      <Card className="flex flex-col gap-1.5">
        <p className="text-sm text-text-h">
          <strong>{entry.actorName}</strong> {ACTION_LABELS[entry.action]}{' '}
          {ENTITY_TYPE_LABELS[entry.entityType]}
        </p>
        <p className="text-sm font-semibold text-text-h">{entry.entityLabel}</p>
        <p className="text-[13px] text-text">{formatTimestamp(entry.createdAt)}</p>
      </Card>

      {before !== null && (
        <Card className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-text-h">Before</h3>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[12px] text-text">
            {JSON.stringify(before, null, 2)}
          </pre>
        </Card>
      )}

      {after !== null && (
        <Card className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-text-h">After</h3>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[12px] text-text">
            {JSON.stringify(after, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}

export function ActivityScreen({ entries, users, onBack }: Props) {
  const {
    search,
    setSearch,
    entityType,
    setEntityType,
    actorUserId,
    setActorUserId,
    from,
    setFrom,
    to,
    setTo,
    resetFilters,
    isFilterActive,
    results,
  } = useAuditLogQuery(entries)

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const selectedEntry = entries.find((e) => e.id === selectedEntryId) ?? null

  if (selectedEntry) {
    return <AuditEntryDetail entry={selectedEntry} onBack={() => setSelectedEntryId(null)} />
  }

  return (
    <div className="flex flex-col gap-3">
      <Breadcrumb onClick={onBack} />
      <h2 className={screenHeading}>Activity</h2>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder={`Staff member or record (${MIN_SEARCH_LENGTH}+ chars)`}
        filter={{
          active: isFilterActive,
          onReset: resetFilters,
          content: (
            <>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>Type</span>
                <Select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as AuditEntityType | 'all')}
                >
                  <option value="all">All types</option>
                  <option value="patient">Patient</option>
                  <option value="patient_group">Patient group</option>
                  <option value="eye_visit">Eye record</option>
                  <option value="appointment">Appointment</option>
                </Select>
              </label>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>Staff member</span>
                <Select value={actorUserId} onChange={(e) => setActorUserId(e.target.value)}>
                  <option value="">All staff</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                    </option>
                  ))}
                </Select>
              </label>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>From date</span>
                <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>To date</span>
                <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </>
          ),
        }}
      />

      <ListView
        items={results}
        getKey={(entry) => entry.id}
        itemLabel="entry"
        itemLabelPlural="entries"
        emptyMessage={entries.length === 0 ? 'No activity recorded yet.' : 'No activity matches.'}
        renderItem={(entry) => (
          <Button
            variant="unstyled"
            className={cx(cardBase, 'flex w-full flex-col gap-1 text-left cursor-pointer')}
            onClick={() => setSelectedEntryId(entry.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-text-h">{entry.actorName}</span>
              <span className="text-[13px] text-text">{formatTimestamp(entry.createdAt)}</span>
            </div>
            <p className="text-[13px] text-text">
              {ACTION_LABELS[entry.action]} {ENTITY_TYPE_LABELS[entry.entityType]}: {entry.entityLabel}
            </p>
          </Button>
        )}
      />
    </div>
  )
}
