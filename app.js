// ==========================================
        // 定数・カテゴリスタイル定義
        // ==========================================
        const STORAGE_KEY = 'minimal_kakeibo_modern_v1';

        const CATEGORY_CONFIG = {
            expense: [
                { name: '食費', color: '#F97316', badgeBg: 'bg-orange-50', badgeText: 'text-orange-700', border: 'border-orange-200/70' },
                { name: '日用品', color: '#0EA5E9', badgeBg: 'bg-sky-50', badgeText: 'text-sky-700', border: 'border-sky-200/70' },
                { name: '交通費', color: '#6366F1', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-700', border: 'border-indigo-200/70' },
                { name: '娯楽', color: '#EC4899', badgeBg: 'bg-pink-50', badgeText: 'text-pink-700', border: 'border-pink-200/70' },
                { name: '光熱・通信', color: '#EAB308', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', border: 'border-amber-200/70' },
                { name: 'その他', color: '#64748B', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', border: 'border-slate-200/70' }
            ],
            income: [
                { name: '給与', color: '#10B981', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', border: 'border-emerald-200/70' },
                { name: 'その他', color: '#14B8A6', badgeBg: 'bg-teal-50', badgeText: 'text-teal-700', border: 'border-teal-200/70' }
            ]
        };

        // アプリケーション状態
        let transactions = [];

        // ==========================================
        // 初期化
        // ==========================================
        window.addEventListener('DOMContentLoaded', () => {
            // 本日の日付を初期設定
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('input-date').value = today;

            // 初期種別（支出）でカテゴリをセットアップ
            setTransactionType('expense');

            // ローカルストレージから復元
            loadData();
            renderAll();

            // フォーム送信イベント
            document.getElementById('transaction-form').addEventListener('submit', handleAddTransaction);
        });

        // ==========================================
        // データ永続化（localStorage）
        // ==========================================
        function loadData() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                transactions = raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.error('Storage read error:', e);
                transactions = [];
                showToast('データの読み込みに失敗しました', 'error');
            }
        }

        function saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
            } catch (e) {
                console.error('Storage write error:', e);
                showToast('ブラウザへの保存に失敗しました', 'error');
            }
        }

        // ==========================================
        // UI操作・イベントハンドラ
        // ==========================================
        function setTransactionType(type) {
            document.getElementById('input-type').value = type;

            const btnExpense = document.getElementById('btn-type-expense');
            const btnIncome = document.getElementById('btn-type-income');
            const submitBtn = document.getElementById('submit-btn');

            if (type === 'expense') {
                btnExpense.className = 'px-4 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-900 shadow-xs transition-all';
                btnIncome.className = 'px-4 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 transition-all';
                submitBtn.className = 'w-full h-10 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5';
            } else {
                btnIncome.className = 'px-4 py-1.5 text-xs font-semibold rounded-lg bg-white text-emerald-700 shadow-xs transition-all';
                btnExpense.className = 'px-4 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 transition-all';
                submitBtn.className = 'w-full h-10 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5';
            }

            // カテゴリの選択肢を更新
            const categorySelect = document.getElementById('input-category');
            categorySelect.innerHTML = '';
            CATEGORY_CONFIG[type].forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        }

        function handleAddTransaction(e) {
            e.preventDefault();

            const type = document.getElementById('input-type').value;
            const date = document.getElementById('input-date').value;
            const category = document.getElementById('input-category').value;
            const amount = parseInt(document.getElementById('input-amount').value, 10);
            const memo = document.getElementById('input-memo').value.trim();

            if (!date || isNaN(amount) || amount <= 0) {
                showToast('日付と1円以上の金額を入力してください', 'error');
                return;
            }

            const newItem = {
                id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
                type,
                date,
                category,
                amount,
                memo
            };

            transactions.push(newItem);
            // 日付降順（新しい順）にソート
            transactions.sort((a, b) => b.date.localeCompare(a.date));

            saveData();
            renderAll();

            // 連続入力しやすいよう金額とメモのみリセット
            document.getElementById('input-amount').value = '';
            document.getElementById('input-memo').value = '';
            document.getElementById('input-amount').focus();

            showToast(`${category}（¥${amount.toLocaleString()}）を記録しました`);
        }

        function deleteTransaction(id) {
            transactions = transactions.filter(t => t.id !== id);
            saveData();
            renderAll();
            showToast('取引を削除しました');
        }

        // サンプルデータの投入
        function loadSampleData() {
            const today = new Date();
            const fmt = (offsetDays) => {
                const d = new Date(today);
                d.setDate(d.getDate() - offsetDays);
                return d.toISOString().split('T')[0];
            };

            const samples = [
                { id: 'smp1', type: 'income', date: fmt(10), category: '給与', amount: 280000, memo: '今月分給与' },
                { id: 'smp2', type: 'expense', date: fmt(8), category: '光熱・通信', amount: 14500, memo: '電気・スマホ代' },
                { id: 'smp3', type: 'expense', date: fmt(5), category: '食費', amount: 4280, memo: 'スーパーまとめ買い' },
                { id: 'smp4', type: 'expense', date: fmt(3), category: '交通費', amount: 1840, memo: 'ICカードチャージ' },
                { id: 'smp5', type: 'expense', date: fmt(2), category: '娯楽', amount: 3500, memo: '映画・カフェ' },
                { id: 'smp6', type: 'expense', date: fmt(1), category: '日用品', amount: 1620, memo: '洗剤・ティッシュ' },
                { id: 'smp7', type: 'expense', date: fmt(0), category: '食費', amount: 980, memo: 'ランチ定食' }
            ];

            transactions = [...samples, ...transactions];
            transactions.sort((a, b) => b.date.localeCompare(a.date));
            saveData();
            renderAll();
            showToast('サンプルデータを読み込みました');
        }

        // 全消去確認バー
        function confirmClearAll() {
            if (transactions.length === 0) {
                showToast('削除するデータがありません');
                return;
            }
            const bar = document.getElementById('confirm-bar');
            bar.classList.remove('hidden');
            document.getElementById('confirm-yes-btn').onclick = () => {
                transactions = [];
                saveData();
                renderAll();
                hideConfirm();
                showToast('すべてのデータを消去しました');
            };
        }

        function hideConfirm() {
            document.getElementById('confirm-bar').classList.add('hidden');
        }

        // CSV出力
        function exportCSV() {
            if (transactions.length === 0) {
                showToast('出力するデータがありません');
                return;
            }
            const header = '日付,種別,カテゴリ,金額,メモ\n';
            const rows = transactions.map(t => {
                const typeText = t.type === 'income' ? '収入' : '支出';
                const escapedMemo = `"${(t.memo || '').replace(/"/g, '""')}"`;
                return `${t.date},${typeText},${t.category},${t.amount},${escapedMemo}`;
            }).join('\n');

            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const blob = new Blob([bom, header + rows], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `kakeibo_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            showToast('CSVファイルをダウンロードしました');
        }

        // ==========================================
        // 画面レンダリング
        // ==========================================
        function renderAll() {
            renderSummary();
            renderHistory();
            renderChart();
        }

        // 1. サマリーKPI描画
        function renderSummary() {
            let income = 0;
            let expense = 0;

            transactions.forEach(t => {
                if (t.type === 'income') income += t.amount;
                else expense += t.amount;
            });

            const balance = income - expense;
            const balanceEl = document.getElementById('summary-balance');

            balanceEl.textContent = `${balance < 0 ? '-' : ''}¥${Math.abs(balance).toLocaleString()}`;
            balanceEl.className = `text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${balance < 0 ? 'text-rose-600' : 'text-slate-900'}`;

            document.getElementById('summary-income').textContent = `¥${income.toLocaleString()}`;
            document.getElementById('summary-expense').textContent = `¥${expense.toLocaleString()}`;
        }

        // 2. 取引履歴リスト描画
        function renderHistory() {
            const listEl = document.getElementById('history-list');
            const emptyEl = document.getElementById('empty-message');
            const countEl = document.getElementById('record-count');

            const filterType = document.getElementById('filter-type').value;
            const keyword = document.getElementById('filter-search').value.trim().toLowerCase();

            const filtered = transactions.filter(t => {
                if (filterType !== 'all' && t.type !== filterType) return false;
                if (keyword) {
                    const matchCategory = t.category.toLowerCase().includes(keyword);
                    const matchMemo = (t.memo || '').toLowerCase().includes(keyword);
                    if (!matchCategory && !matchMemo) return false;
                }
                return true;
            });

            countEl.textContent = `${filtered.length}件`;
            listEl.innerHTML = '';

            if (filtered.length === 0) {
                emptyEl.classList.remove('hidden');
                return;
            }
            emptyEl.classList.add('hidden');

            filtered.forEach(t => {
                const style = getCategoryStyle(t.type, t.category);
                const isIncome = t.type === 'income';
                const sign = isIncome ? '+' : '-';
                const amountColor = isIncome ? 'text-emerald-600' : 'text-slate-900';

                const row = document.createElement('div');
                row.className = 'px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition group';

                row.innerHTML = `
                    <div class="flex items-center gap-3 min-w-0">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border shrink-0 ${style.badgeBg} ${style.badgeText} ${style.border}">
                            ${escapeHTML(t.category)}
                        </span>
                        <div class="min-w-0">
                            <p class="text-sm font-medium text-slate-800 truncate">
                                ${t.memo ? escapeHTML(t.memo) : `<span class="text-slate-400 font-normal">${escapeHTML(t.category)}</span>`}
                            </p>
                            <p class="text-[11px] text-slate-400 tabular-nums mt-0.5">${escapeHTML(t.date)}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 shrink-0">
                        <span class="text-sm font-semibold tabular-nums ${amountColor}">
                            ${sign}¥${t.amount.toLocaleString()}
                        </span>
                        <button type="button" onclick="deleteTransaction('${t.id}')" title="削除" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                `;
                listEl.appendChild(row);
            });
        }

        // 3. カテゴリ別支出バー描画
        function renderChart() {
            const container = document.getElementById('chart-container');
            const totalLabel = document.getElementById('chart-total-label');
            container.innerHTML = '';

            // 支出カテゴリごとに集計
            const totals = {};
            CATEGORY_CONFIG.expense.forEach(c => totals[c.name] = 0);

            let totalExpense = 0;
            transactions.forEach(t => {
                if (t.type === 'expense') {
                    totals[t.category] = (totals[t.category] || 0) + t.amount;
                    totalExpense += t.amount;
                }
            });

            totalLabel.textContent = `合計: ¥${totalExpense.toLocaleString()}`;

            if (totalExpense === 0) {
                container.innerHTML = `
                    <div class="py-10 text-center">
                        <p class="text-xs text-slate-400">支出データが記録されると<br>カテゴリ別の割合が表示されます</p>
                    </div>
                `;
                return;
            }

            // 金額の大きい順に並べる
            const sorted = CATEGORY_CONFIG.expense
                .map(c => ({ ...c, amount: totals[c.name] || 0 }))
                .sort((a, b) => b.amount - a.amount);

            sorted.forEach(item => {
                const pct = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;

                const block = document.createElement('div');
                block.className = 'space-y-1.5';
                block.innerHTML = `
                    <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${item.color};"></span>
                            <span class="font-medium text-slate-700">${escapeHTML(item.name)}</span>
                        </div>
                        <div class="tabular-nums text-slate-600">
                            <span class="font-semibold text-slate-900">¥${item.amount.toLocaleString()}</span>
                            <span class="text-slate-400 ml-1">(${pct}%)</span>
                        </div>
                    </div>
                    <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-300" style="width: ${pct}%; background-color: ${item.color};"></div>
                    </div>
                `;
                container.appendChild(block);
            });
        }

        // ==========================================
        // ユーティリティ関数
        // ==========================================
        function getCategoryStyle(type, categoryName) {
            const list = CATEGORY_CONFIG[type] || [];
            return list.find(c => c.name === categoryName) || {
                color: '#64748B',
                badgeBg: 'bg-slate-100',
                badgeText: 'text-slate-700',
                border: 'border-slate-200'
            };
        }

        function showToast(message, type = 'default') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            const bgClass = type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white';

            toast.className = `${bgClass} text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 toast-enter`;
            toast.textContent = message;

            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.2s ease';
                setTimeout(() => toast.remove(), 200);
            }, 2600);
        }

        function escapeHTML(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }