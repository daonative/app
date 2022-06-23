import { Card } from "@/components/Card";
import { Input, Label, Select, TextField } from "@/components/Input";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from "@/components/Modal";
import useMembership from "@/lib/useMembership";
import useRoomId from "@/lib/useRoomId";
import { CheckIcon, PlusIcon } from "@heroicons/react/solid";
import Image from "next/image";
import { useWallet } from "@/lib/useWallet";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRequireAuthentication } from "@/lib/authenticate";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { classNames } from "@/lib/utils";
import EmptyStateNoRewards from "@/components/EmptyStateNoRewards";
import Spinner from "@/components/Spinner";
import { PageHeader } from "@/components/PageHeader";

const CreateRewardModal = ({ show, onClose }) => {
  const [eligibleCount, setEligibleCount] = useState(null);
  const [calculatingEligibleCount, setCalculatingEligibleCount] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    reset,
  } = useForm();
  const requireAuthentication = useRequireAuthentication();
  const roomId = useRoomId();

  const xps = watch("xps");

  useEffect(() => {
    const retrieveEligibleMembersCount = async (minXps) => {
      setCalculatingEligibleCount(true);
      const db = getFirestore();
      const eligibleCountQuery = query(
        collection(db, "rooms", roomId, "leaderboard"),
        where("verifiedExperience", ">=", minXps),
      );
      const eligibleCountSnap = await getDocs(eligibleCountQuery);
      const eligibleCount = eligibleCountSnap.docs.length;
      setEligibleCount(eligibleCount);
      setCalculatingEligibleCount(false);
    };

    if (!xps || !roomId) return;

    try {
      const minXps = Number(xps);
      retrieveEligibleMembersCount(minXps);
    } catch (e) {
      console.error(e);
    }
  }, [xps, roomId]);

  const createRolesReward = async (name, role, xps) => {
    const db = getFirestore();
    await addDoc(collection(db, "rewards"), {
      roomId,
      name,
      reward: {
        type: "role",
        role: role,
      },
      conditionTypes: ["minXps"],
      conditions: { minXps: xps },
    });
  };

  const handleCreateReward = async (data) => {
    await requireAuthentication();
    await createRolesReward(data.name, data.role, Number(data.xps));
    reset();
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Create reward</ModalTitle>
      <form onSubmit={handleSubmit(handleCreateReward)}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <TextField label="Reward Name" name="name" register={register} required />
              {errors.name && (
                <span className="text-xs text-red-400">You need to set a reward name</span>
              )}
            </div>
            <div>
              <Select label={"Reward Type"} register={register} name="type">
                <option value="role">Role</option>
                <option value="nft" disabled>
                  NFT
                </option>
              </Select>
            </div>
            <div>
              <Select label={"Reward with role"} register={register} name="role">
                <option value="verifier">Verifier</option>
                <option value="lurker">Lurker</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">Active condition(s)</label>
              <div className="border-2 border-daonative-border py-2 px-2 rounded-md w-full text-xs text-daonative-subtitle">
                💡 This role will be given automatically to members that fit the following criteria
              </div>
              <Label className={"mt-3"}>At least</Label>
              <div className="relative rounded-md shadow-sm" style={{ maxWidth: "100px" }}>
                <Input register={register} name="xps" required placeholder="100" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">XPs</span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <div className="flex items-center gap-2">
            {calculatingEligibleCount && (
              <span className="w-4 h-4">
                <Spinner />
              </span>
            )}
            {!!eligibleCount && (
              <span className="flex items-center text-sm text-daonative-gray-300">
                <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
                {eligibleCount} member(s) will receive this role
              </span>
            )}
            <PrimaryButton type="submit">Create Reward</PrimaryButton>
          </div>
        </ModalActionFooter>
      </form>
    </Modal>
  );
};

const RewardDetailModal = ({ show, onClose, reward }) => {
  const requireAuthentication = useRequireAuthentication();

  const deleteReward = async () => {
    const db = getFirestore();
    await deleteDoc(doc(db, "rewards", reward.rewardId));
  };

  const handleDeleteReward = async () => {
    await requireAuthentication();
    await deleteReward();
    onClose();
  };

  const capitalizeFirstLetter = (string) => {
    try {
      return string.charAt(0).toUpperCase() + string.slice(1);
    } catch (e) {
      return string;
    }
  };

  const title = reward.name;
  const weight = reward?.conditions?.minXps;
  const eligibleCount = reward?.meta?.eligibleCount;
  const role = capitalizeFirstLetter(reward?.reward?.role);

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>{title}</ModalTitle>
      <ModalBody>
        <div className="flex flex-col gap-2">
          <div>
            <p className="block text-sm font-medium pb-0.5 text-daonative-subtitle">Reward:</p>
            <div className="text-sm font-medium text-daonative-white">{role} role</div>
          </div>
          <div>
            <p className="block text-sm font-medium pb-0.5 text-daonative-subtitle">Requirement:</p>
            <div className="text-sm font-medium text-daonative-white">at least {weight} XP</div>
          </div>
          <div>
            <p className="block text-sm font-medium pb-0.5 text-daonative-subtitle">
              Eligible members:
            </p>
            <div className="text-sm font-medium text-daonative-white">{eligibleCount}</div>
          </div>
        </div>
      </ModalBody>
      <ModalActionFooter>
        <div className="flex flex-col items-end gap-1">
          <SecondaryButton onClick={handleDeleteReward}>Delete</SecondaryButton>
          <span className="text-xs text-daonative-subtitle">
            💡 Deleting this will not remove the rewards from people who were already eligible
          </span>
        </div>
      </ModalActionFooter>
    </Modal>
  );
};

const RewardItem = ({ reward }) => {
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleOpenDetailModal = () => setDetailModalOpen(true);
  const handleCloseDetailModal = () => setDetailModalOpen(false);

  const title = reward.name;
  const type = "Role";
  const weight = reward?.conditions?.minXps;
  const eligibleCount = reward?.meta?.eligibleCount;

  return (
    <Card onClick={handleOpenDetailModal}>
      <RewardDetailModal show={detailModalOpen} onClose={handleCloseDetailModal} reward={reward} />
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div>
            <Image width="64" height="64" src="/reward.svg" alt="sample-challenge-picture" />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold  whitespace-normal ">{title}</p>
            <div className="text-sm text-daonative-subtitle">{type}</div>
          </div>
        </div>
        <div className="flex flex-col items-end min-w-max gap-3">
          <div
            className={classNames(
              "flex items-center text-sm text-daonative-gray-300",
              !eligibleCount && "invisible",
            )}
          >
            <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
            <p>{eligibleCount} Members</p>
          </div>
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {weight} XPs
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Rewards = () => {
  const db = getFirestore();
  const { account } = useWallet();
  const roomId = useRoomId();
  const membership = useMembership(account, roomId);
  const isAdmin = membership?.roles?.includes("admin");
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardsSnap, loading] = useCollection(
    query(collection(db, "rewards"), where("roomId", "==", roomId || "")),
  );

  const rewards = rewardsSnap?.docs.map((doc) => ({ rewardId: doc.id, ...doc.data() })) || [];

  const handleShowRewardModal = () => setRewardModalOpen(true);
  const handleCloseRewardModal = () => setRewardModalOpen(false);

  return (
    <LayoutWrapper>
      <CreateRewardModal show={rewardModalOpen} onClose={handleCloseRewardModal} />
      <div className="mx-auto px-4 sm:px-0 max-w-5xl" >
        <div className="flex flex-col gap-4">
          <PageHeader>
            <div className="flex justify-between pb-2">
              <h2 className="text-2xl">Rewards</h2>
              {isAdmin && (
                <PrimaryButton onClick={handleShowRewardModal}>Add a reward</PrimaryButton>
              )}
            </div>
          </PageHeader>
          {rewards?.length > 0 && (
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {rewards?.map((reward, index) => (
                <RewardItem key={index} reward={reward} />
              ))}
            </ul>
          )}

          {!loading && rewards?.length === 0 && (
            <div className="mt-6">
              <EmptyStateNoRewards>
                {isAdmin && (
                  <>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a reward</p>
                    <div className="mt-6">
                      <PrimaryButton onClick={handleShowRewardModal}>
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add a reward
                      </PrimaryButton>
                    </div>
                  </>
                )}
              </EmptyStateNoRewards>
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default Rewards;
